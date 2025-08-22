import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    // Integrate with Swell's password reset
    try {
      const swell = require('swell-js');
      swell.init(process.env.SWELL_STORE_ID, process.env.SWELL_PUBLIC_KEY);

      // Get the base URL for the reset link
      const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000';

      const result = await swell.account.recover({
        email: email,
        reset_url: `${baseUrl}/account/reset-password?key=$key` // Swell uses $key placeholder
      });

      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, you will receive reset instructions.'
      });
    } catch (error) {
      console.error('Swell password reset error:', error);
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
