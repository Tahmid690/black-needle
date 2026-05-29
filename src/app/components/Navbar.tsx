"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // When not scrolled (over hero), use white text. When scrolled (frosted glass bg), use dark text.
  const textColor = isScrolled ? "text-neutral-900" : "text-white";
  const textMuted = isScrolled ? "text-neutral-600" : "text-white/70";
  const textHover = isScrolled ? "hover:text-neutral-900" : "hover:text-white";
  const iconColor = isScrolled ? "text-neutral-600 hover:text-neutral-900" : "text-white/80 hover:text-white";

  return (
    <>
      <header
        className={`fixed top-8 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-neutral-100 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className={`text-lg sm:text-xl font-bold tracking-[0.25em] transition-colors duration-300 ${textColor}`}
              >
                BLACK NEEDLE
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-8 lg:space-x-12">
              <Link
                href="#new-drops"
                className={`text-xs uppercase tracking-widest transition-colors duration-300 ${textMuted} ${textHover}`}
              >
                New Drops
              </Link>
              <Link
                href="#about"
                className={`text-xs uppercase tracking-widest transition-colors duration-300 ${textMuted} ${textHover}`}
              >
                About
              </Link>
              <Link
                href="#contact"
                className={`text-xs uppercase tracking-widest transition-colors duration-300 ${textMuted} ${textHover}`}
              >
                Contact
              </Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-2.5 sm:space-x-4 lg:space-x-6">
              {/* Search */}
              <button
                type="button"
                className={`p-1.5 transition-colors duration-300 ${iconColor}`}
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5 stroke-[1.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z"
                  />
                </svg>
              </button>

              {/* User Account */}
              <button
                type="button"
                className={`p-1.5 transition-colors duration-300 ${iconColor}`}
                aria-label="Account"
              >
                <svg
                  className="w-5 h-5 stroke-[1.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                type="button"
                className={`relative p-1.5 transition-colors duration-300 ${iconColor}`}
                aria-label="Open cart"
              >
                <svg
                  className="w-5 h-5 stroke-[1.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                {/* Cart indicator bubble */}
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[9px] font-bold ring-1 ring-neutral-200">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className={`md:hidden p-1.5 transition-colors duration-300 ${iconColor}`}
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 stroke-[1.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-neutral-100">
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link
                href="#new-drops"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-900 py-2"
              >
                New Drops
              </Link>
              <Link
                href="#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-900 py-2"
              >
                About
              </Link>
              <Link
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-900 py-2"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Action Drawer Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity duration-300"
          onClick={() => setIsCartOpen(false)}
        >
          {/* Cart Drawer Panel */}
          <div
            className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-900">
                YOUR CART
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                type="button"
                className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Close cart"
              >
                <svg
                  className="w-5 h-5 stroke-[1.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Cart Contents */}
            {cart.length === 0 ? (
              /* Empty Cart State */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <svg
                  className="w-12 h-12 text-neutral-300 mb-4 stroke-[1]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2 font-semibold">
                  Your cart is empty
                </p>
                <p className="text-[11px] text-neutral-400 tracking-wide">
                  Explore our latest drops to find your perfect fit.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  type="button"
                  className="mt-8 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold tracking-widest py-3 px-8 uppercase transition-colors"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              <>
                {/* Active Items Scrollable List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cart.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex space-x-4 border-b border-neutral-100 pb-6 last:border-0 last:pb-0"
                    >
                      {/* Image */}
                      <div className="relative w-16 sm:w-20 aspect-[3/4] bg-neutral-50 overflow-hidden border border-neutral-100 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      {/* Product details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 pr-2">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              type="button"
                              className="text-neutral-400 hover:text-neutral-900 p-0.5 transition-colors"
                              aria-label="Remove item"
                            >
                              <svg
                                className="w-4 h-4 stroke-[1.5]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wide font-medium">
                            {item.color} / {item.size}
                          </p>
                        </div>

                        {/* Quantity picker & price subtotal */}
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center border border-neutral-200 bg-white">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                              type="button"
                            >
                              —
                            </button>
                            <span className="px-2 text-xs font-semibold text-neutral-950 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-30"
                              type="button"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-bold text-neutral-900">
                            {(item.price * item.quantity).toLocaleString()} BDT
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals Footer Summary */}
                <div className="border-t border-neutral-100 p-6 bg-neutral-50/50 space-y-4">
                  <div className="flex justify-between text-xs tracking-wider uppercase text-neutral-500 font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">
                      {cart
                        .reduce((sum, item) => sum + item.price * item.quantity, 0)
                        .toLocaleString()}{" "}
                      BDT
                    </span>
                  </div>
                  <div className="flex justify-between text-xs tracking-wider uppercase text-neutral-500 font-medium">
                    <span>Shipping</span>
                    <span className="text-neutral-950 font-bold tracking-widest">FREE</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-4 flex justify-between text-xs tracking-widest uppercase font-bold text-neutral-950">
                    <span>Grand Total</span>
                    <span>
                      {cart
                        .reduce((sum, item) => sum + item.price * item.quantity, 0)
                        .toLocaleString()}{" "}
                      BDT
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 block w-full bg-neutral-900 hover:bg-neutral-800 text-white text-center text-xs font-bold tracking-widest py-4 uppercase transition-colors"
                  >
                    PROCEED TO CHECKOUT
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
