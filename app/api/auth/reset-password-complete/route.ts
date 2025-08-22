import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { key, password } = await request.json();

    // Validate inputs
    if (!key) {
      return NextResponse.json({ error: 'Reset key is required' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Use Swell to complete the password reset
    try {
      const swell = require('swell-js');
      swell.init(process.env.SWELL_STORE_ID, process.env.SWELL_PUBLIC_KEY);

      const result = await swell.account.recover({
        password_reset_key: key,
        password: password
      });

      return NextResponse.json({
        success: true,
        message: 'Password has been successfully updated.'
      });
    } catch (error: any) {
      console.error('Swell password reset complete error:', error);

      // Handle specific Swell errors
      if (error.code === 'invalid_request') {
        return NextResponse.json(
          { error: 'Invalid or expired reset link. Please request a new password reset.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Password reset complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
