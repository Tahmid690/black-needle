import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "../send-otp/route";

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone number and verification code are required." },
        { status: 400 }
      );
    }

    const stored = otpStore.get(phone);

    if (!stored) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 404 }
      );
    }

    if (stored.expiresAt < Date.now()) {
      otpStore.delete(phone);
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    if (stored.code !== code.trim()) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please try again." },
        { status: 422 }
      );
    }

    // OTP verified — clean up
    otpStore.delete(phone);

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Phone number verified successfully.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
