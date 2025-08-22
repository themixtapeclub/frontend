// app/api/klaviyo/track/route.ts
import { ApiKeySession, EventsApi } from 'klaviyo-api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, eventName, properties } = await request.json();

    if (!email || !eventName) {
      return NextResponse.json({ message: 'Email and event name are required' }, { status: 400 });
    }

    // Initialize Klaviyo SDK
    const session = new ApiKeySession(process.env.KLAVIYO_PRIVATE_API_KEY!);
    const eventsApi = new EventsApi(session);

    // Create event
    const eventData = {
      data: {
        type: 'event' as const,
        attributes: {
          profile: {
            data: {
              type: 'profile' as const,
              attributes: { email }
            }
          },
          metric: {
            data: {
              type: 'metric' as const,
              attributes: { name: eventName }
            }
          },
          properties: {
            timestamp: new Date().toISOString(),
            ...properties
          }
        }
      }
    };

    await eventsApi.createEvent(eventData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
