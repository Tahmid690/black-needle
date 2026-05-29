"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../context/CartContext";

type PhoneStatus = "idle" | "sending" | "sent" | "verifying" | "verified";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    addressLine: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone verification state
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, [cooldown]);

  // Reset verification if phone number changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);

    if (name === "phone" && phoneStatus !== "idle") {
      setPhoneStatus("idle");
      setOtpCode("");
      setOtpError(null);
      setDevCode(null);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!form.phone || form.phone.length < 10) {
      setOtpError("Please enter a valid phone number first.");
      return;
    }

    setPhoneStatus("sending");
    setOtpError(null);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setPhoneStatus("sent");
      setCooldown(30);
      if (data.devCode) {
        setDevCode(data.devCode);
      }
    } catch (err: any) {
      setOtpError(err.message);
      setPhoneStatus("idle");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Enter the 6-digit code.");
      return;
    }

    setPhoneStatus("verifying");
    setOtpError(null);

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, code: otpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setPhoneStatus("verified");
      setDevCode(null);
    } catch (err: any) {
      setOtpError(err.message);
      setPhoneStatus("sent");
    }
  };

  // Submit order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (phoneStatus !== "verified") {
      setError("Please verify your phone number before placing the order.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map((item) => ({
            variantId: item.variantId,
            name: item.name,
            color: item.color,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
          })),
          shipping: form,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      clearCart();
      router.push(`/order-success/${data.orderId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  // Empty cart state
  if (cart.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <svg className="w-12 h-12 text-neutral-300 mx-auto mb-6 stroke-[1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 mb-2">Your Cart Is Empty</h2>
          <p className="text-xs text-neutral-500 tracking-wide mb-8">Add items to your cart before checking out.</p>
          <Link href="/#new-drops" className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold tracking-widest py-3 px-8 uppercase transition-colors">
            EXPLORE SHIRTS
          </Link>
        </div>
      </div>
    );
  }

  const isFormValid = form.name && form.phone && form.city && form.addressLine && phoneStatus === "verified";

  return (
    <div className="min-h-screen bg-white">
      {/* Top announcement bar */}
      <div className="h-8 bg-black text-white flex items-center justify-center">
        <span className="text-[9px] sm:text-xs tracking-[0.2em] font-medium uppercase">
          FREE SHIPPING NATIONWIDE | EASY 7-DAY FIT EXCHANGE
        </span>
      </div>

      {/* Header */}
      <header className="border-b border-neutral-100 px-4 sm:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-[0.25em] uppercase text-neutral-900">
          BLACK NEEDLE
        </Link>
        <Link href="/" className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
          <svg className="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Back to Shop</span>
        </Link>
      </header>

      {/* Main checkout layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        {/* LEFT — Shipping & Payment */}
        <div>
          {/* ───── STEP 01: Shipping ───── */}
          <div className="mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-2">
              STEP 01
            </span>
            <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.15em] text-neutral-900 font-serif">
              Shipping Details
            </h1>
            <div className="mt-3 w-10 h-[1px] bg-neutral-900"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" id="checkout-form">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Tahmid Rahman"
                className="w-full border border-neutral-200 focus:border-neutral-900 outline-none py-3.5 px-4 text-sm tracking-wide text-neutral-900 placeholder-neutral-300 transition-colors"
              />
            </div>

            {/* Phone + OTP Verification */}
            <div>
              <label htmlFor="phone" className="block text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-3">
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 01700000000"
                  disabled={phoneStatus === "verified"}
                  className="flex-1 border border-neutral-200 focus:border-neutral-900 outline-none py-3.5 px-4 text-sm tracking-wide text-neutral-900 placeholder-neutral-300 transition-colors disabled:bg-neutral-50 disabled:text-neutral-500"
                />
                {phoneStatus === "verified" ? (
                  <div className="flex items-center space-x-2 px-4 border border-green-200 bg-green-50">
                    <svg className="w-4 h-4 text-green-600 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-green-700">Verified</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={phoneStatus === "sending" || cooldown > 0 || !form.phone}
                    className="px-5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-[10px] font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {phoneStatus === "sending"
                      ? "SENDING…"
                      : cooldown > 0
                      ? `WAIT ${cooldown}S`
                      : phoneStatus === "sent"
                      ? "RESEND"
                      : "VERIFY"}
                  </button>
                )}
              </div>

              {/* OTP Input Field */}
              {(phoneStatus === "sent" || phoneStatus === "verifying") && (
                <div className="mt-3 space-y-2">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setOtpCode(val);
                        if (otpError) setOtpError(null);
                      }}
                      placeholder="Enter 6-digit code"
                      className="flex-1 border border-neutral-200 focus:border-neutral-900 outline-none py-3 px-4 text-sm tracking-[0.3em] text-center font-mono font-bold text-neutral-900 placeholder-neutral-300 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={phoneStatus === "verifying" || otpCode.length !== 6}
                      className="px-5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-[10px] font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed"
                    >
                      {phoneStatus === "verifying" ? "CHECKING…" : "CONFIRM"}
                    </button>
                  </div>

                  {/* Dev mode code hint */}
                  {devCode && (
                    <div className="bg-amber-50 border border-amber-200 px-3 py-2 flex items-center space-x-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-amber-700">DEV MODE</span>
                      <span className="text-xs font-mono font-bold text-amber-900 tracking-[0.25em]">{devCode}</span>
                    </div>
                  )}
                </div>
              )}

              {/* OTP error */}
              {otpError && (
                <p className="text-[10px] text-red-600 tracking-wide mt-2 font-semibold uppercase">{otpError}</p>
              )}

              {/* Status helper text */}
              {phoneStatus === "idle" && (
                <p className="text-[10px] text-neutral-400 tracking-wide mt-1.5 uppercase font-medium">
                  We'll send a verification code to confirm your number.
                </p>
              )}
              {phoneStatus === "verified" && (
                <p className="text-[10px] text-green-600 tracking-wide mt-1.5 uppercase font-semibold">
                  ✓ Phone verified — order updates will be sent to this number.
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">
                City / District <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="e.g. Dhaka"
                className="w-full border border-neutral-200 focus:border-neutral-900 outline-none py-3.5 px-4 text-sm tracking-wide text-neutral-900 placeholder-neutral-300 transition-colors"
              />
            </div>

            {/* Address Line */}
            <div>
              <label htmlFor="addressLine" className="block text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">
                Full Address <span className="text-red-500">*</span>
              </label>
              <input
                id="addressLine"
                type="text"
                name="addressLine"
                value={form.addressLine}
                onChange={handleChange}
                required
                placeholder="Road, Block, Area, Apartment No."
                className="w-full border border-neutral-200 focus:border-neutral-900 outline-none py-3.5 px-4 text-sm tracking-wide text-neutral-900 placeholder-neutral-300 transition-colors"
              />
            </div>

            {/* ───── STEP 02: Payment Method ───── */}
            <div className="pt-6 border-t border-neutral-100">
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-2">
                  STEP 02
                </span>
                <h2 className="text-xl sm:text-2xl font-light uppercase tracking-[0.15em] text-neutral-900 font-serif">
                  Payment Method
                </h2>
                <div className="mt-3 w-10 h-[1px] bg-neutral-900"></div>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery — Active */}
                <label
                  className={`flex items-center space-x-4 p-4 border cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 accent-neutral-900"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">Cash on Delivery</span>
                      <span className="text-[9px] uppercase tracking-widest font-bold bg-neutral-900 text-white px-2 py-0.5">Default</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 tracking-wide mt-1 uppercase font-medium">
                      Pay when your order arrives at your doorstep.
                    </p>
                  </div>
                  <span className="text-lg">💵</span>
                </label>

                {/* bKash — Coming Soon */}
                <div className="flex items-center space-x-4 p-4 border border-neutral-100 bg-neutral-50/50 opacity-50 cursor-not-allowed">
                  <input type="radio" disabled className="w-4 h-4 accent-neutral-400" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">bKash</span>
                      <span className="text-[9px] uppercase tracking-widest font-bold bg-neutral-200 text-neutral-500 px-2 py-0.5">Coming Soon</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 tracking-wide mt-1 uppercase font-medium">
                      Mobile wallet payment via bKash.
                    </p>
                  </div>
                  <span className="text-lg opacity-40">📱</span>
                </div>

                {/* Nagad — Coming Soon */}
                <div className="flex items-center space-x-4 p-4 border border-neutral-100 bg-neutral-50/50 opacity-50 cursor-not-allowed">
                  <input type="radio" disabled className="w-4 h-4 accent-neutral-400" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Nagad</span>
                      <span className="text-[9px] uppercase tracking-widest font-bold bg-neutral-200 text-neutral-500 px-2 py-0.5">Coming Soon</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 tracking-wide mt-1 uppercase font-medium">
                      Mobile wallet payment via Nagad.
                    </p>
                  </div>
                  <span className="text-lg opacity-40">📱</span>
                </div>

                {/* Card — Coming Soon */}
                <div className="flex items-center space-x-4 p-4 border border-neutral-100 bg-neutral-50/50 opacity-50 cursor-not-allowed">
                  <input type="radio" disabled className="w-4 h-4 accent-neutral-400" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Credit / Debit Card</span>
                      <span className="text-[9px] uppercase tracking-widest font-bold bg-neutral-200 text-neutral-500 px-2 py-0.5">Coming Soon</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 tracking-wide mt-1 uppercase font-medium">
                      Visa, Mastercard, AMEX.
                    </p>
                  </div>
                  <span className="text-lg opacity-40">💳</span>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="border border-red-200 bg-red-50 p-4">
                <p className="text-xs text-red-700 font-semibold tracking-wide uppercase">{error}</p>
              </div>
            )}

            {/* Submit CTA — mobile */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="lg:hidden w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-bold tracking-widest py-4 uppercase transition-colors disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>PROCESSING ORDER…</span>
                </span>
              ) : (
                "CONFIRM ORDER — CASH ON DELIVERY"
              )}
            </button>
          </form>
        </div>

        {/* RIGHT — Order Summary */}
        <div className="lg:sticky lg:top-8">
          <div className="mb-8">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-2">
              STEP 03
            </span>
            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.15em] text-neutral-900 font-serif">
              Order Summary
            </h2>
            <div className="mt-3 w-10 h-[1px] bg-neutral-900"></div>
          </div>

          {/* Cart Items */}
          <div className="border border-neutral-100 divide-y divide-neutral-100">
            {cart.map((item) => (
              <div key={item.variantId} className="flex items-start space-x-4 p-5">
                <div className="w-16 h-20 relative bg-neutral-50 border border-neutral-100 flex-shrink-0 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-900 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">{item.name}</h3>
                  <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wide font-medium">
                    {item.color} · Size {item.size}
                  </p>
                  <p className="text-xs font-bold text-neutral-900 mt-2 tracking-wider">
                    {(item.price * item.quantity).toLocaleString()} BDT
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="border border-t-0 border-neutral-100 p-5 bg-neutral-50/60 space-y-3">
            <div className="flex justify-between text-xs uppercase tracking-widest text-neutral-500 font-medium">
              <span>Subtotal</span>
              <span className="text-neutral-900 font-bold">{total.toLocaleString()} BDT</span>
            </div>
            <div className="flex justify-between text-xs uppercase tracking-widest text-neutral-500 font-medium">
              <span>Shipping</span>
              <span className="text-neutral-900 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-xs uppercase tracking-widest text-neutral-500 font-medium">
              <span>Payment</span>
              <span className="text-neutral-900 font-bold">Cash on Delivery</span>
            </div>
            <div className="border-t border-neutral-200 pt-3 flex justify-between text-sm uppercase tracking-widest font-bold text-neutral-950">
              <span>Grand Total</span>
              <span>{total.toLocaleString()} BDT</span>
            </div>
          </div>

          {/* Verification status badge */}
          {phoneStatus !== "verified" && (
            <div className="mt-3 border border-amber-200 bg-amber-50 p-3 flex items-center space-x-2">
              <svg className="w-4 h-4 text-amber-600 stroke-[1.5] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span className="text-[10px] uppercase tracking-widest font-bold text-amber-700">
                Verify your phone number to place the order
              </span>
            </div>
          )}

          {/* Submit CTA — desktop */}
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting || !isFormValid}
            className="hidden lg:block w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-bold tracking-widest py-4 uppercase transition-colors disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>PROCESSING ORDER…</span>
              </span>
            ) : (
              "CONFIRM ORDER — CASH ON DELIVERY"
            )}
          </button>

          {/* Trust signals */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: "🔒", label: "Secure Order" },
              { icon: "🚚", label: "Free Delivery" },
              { icon: "🔄", label: "7-Day Exchange" },
            ].map((trust) => (
              <div key={trust.label} className="flex flex-col items-center space-y-1">
                <span className="text-lg">{trust.icon}</span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">
                  {trust.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
