import { NextRequest, NextResponse } from 'next/server';
import { setAdminSessionCookie } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD is not set in env variables');
      return NextResponse.json(
        { success: false, error: 'Server authentication misconfigured' },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      await setAdminSessionCookie();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Incorrect password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request payload' },
      { status: 400 }
    );
  }
}
