import { NextRequest, NextResponse } from "next/server";

// In-memory OTP store (in production, use Redis or a database table with TTL)
// Map<phone, { code: string; expiresAt: number }>
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Clean up expired OTPs periodically
function cleanExpired() {
  const now = Date.now();
  for (const [phone, data] of otpStore) {
    if (data.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    cleanExpired();

    // Rate limit: don't allow resending within 30 seconds
    const existing = otpStore.get(phone);
    if (existing && existing.expiresAt - 270_000 > Date.now()) {
      // 300s total TTL minus 270s = must wait 30s between sends
      return NextResponse.json(
        { error: "Please wait 30 seconds before requesting a new code." },
        { status: 429 }
      );
    }

    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store with 5-minute expiry
    otpStore.set(phone, {
      code,
      expiresAt: Date.now() + 300_000, // 5 minutes
    });

    // TODO: In production, send SMS via Twilio/MessageBird/etc.
    // For development, we return the code in the response
    console.log(`[OTP] Phone: ${phone} → Code: ${code}`);

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
      // DEV ONLY: Remove this in production when SMS is integrated
      devCode: process.env.NODE_ENV === "development" ? code : undefined,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code." },
      { status: 500 }
    );
  }
}

// Export the store so verify-otp can access it
export { otpStore };
