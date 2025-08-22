// app/api/klaviyo/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Use direct Klaviyo API calls instead of SDK for better control over subscription consent

// Bot protection helpers
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip)!;
  const recentRequests = requests.filter((time) => time > windowStart);

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return false;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isBot(userAgent?: string, referrer?: string): boolean {
  if (!userAgent) return true;

  // Allow localhost/development - no referrer is normal for localhost
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    // Only check for obvious bot patterns in development
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /facebook/i,
      /twitter/i,
      /linkedin/i
    ];

    const suspiciousPatterns = [/HeadlessChrome/i, /PhantomJS/i, /Selenium/i];

    return (
      botPatterns.some((pattern) => pattern.test(userAgent)) ||
      suspiciousPatterns.some((pattern) => pattern.test(userAgent))
    );
  }

  // Production bot detection (more strict)
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /facebook/i,
    /twitter/i,
    /linkedin/i
  ];

  const suspiciousPatterns = [/HeadlessChrome/i, /PhantomJS/i, /Selenium/i];

  return (
    botPatterns.some((pattern) => pattern.test(userAgent)) ||
    suspiciousPatterns.some((pattern) => pattern.test(userAgent)) ||
    !referrer ||
    referrer === ''
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }

    const { email, lists, metadata, timestamp, referrer, userAgent } = await request.json();

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    // Bot detection
    if (isBot(userAgent, referrer)) {
      return NextResponse.json(
        { message: 'Subscription successful' }, // Don't reveal bot detection
        { status: 200 }
      );
    }

    // Time-based validation (prevent pre-filled forms) - disabled for testing
    const submissionTime = Date.now() - timestamp;
    if (process.env.NODE_ENV === 'production' && submissionTime < 1000) {
      return NextResponse.json({ message: 'Subscription successful' }, { status: 200 });
    }

    // Create profile first (this just stores the contact info)
    const profileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_API_KEY}`,
        'Content-Type': 'application/json',
        revision: '2024-07-15'
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email: email,
            properties: {
              source: 'website',
              signup_timestamp: new Date().toISOString(),
              consent_method: 'website_form',
              ...metadata
            }
          }
        }
      })
    });

    const profileData = await profileResponse.json();
    const profileId = profileData.data?.id;

    // Now subscribe them to email marketing with explicit consent
    const subscriptionPayload = {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [
              {
                type: 'profile',
                attributes: {
                  email: email,
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: 'SUBSCRIBED'
                        // Remove consented_at - only for historical imports
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      }
    };

    // Add list relationships if lists are provided
    if (lists && lists.length > 0) {
      const payload = subscriptionPayload as any;
      payload.data.relationships = {
        list: {
          data: {
            type: 'list',
            id: lists[0] // Use first list for the subscription job
          }
        }
      };
    }

    const subscribeResponse = await fetch(
      'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/',
      {
        method: 'POST',
        headers: {
          Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_API_KEY}`,
          'Content-Type': 'application/json',
          revision: '2024-07-15'
        },
        body: JSON.stringify(subscriptionPayload)
      }
    );

    let subscribeData;
    const responseText = await subscribeResponse.text();

    try {
      subscribeData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      subscribeData = { error: 'Invalid JSON response', rawResponse: responseText };
    }

    // If multiple lists, add to the remaining lists
    if (lists && lists.length > 1) {
      const additionalListPromises = lists.slice(1).map((listId: string) =>
        fetch(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, {
          method: 'POST',
          headers: {
            Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_API_KEY}`,
            'Content-Type': 'application/json',
            revision: '2024-07-15'
          },
          body: JSON.stringify({
            data: [
              {
                type: 'profile',
                id: profileId
              }
            ]
          })
        }).catch((error) => {
          return null;
        })
      );

      await Promise.allSettled(additionalListPromises);
    }

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      message: 'Subscription successful',
      profileId: profileId,
      processingTime: totalTime
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
