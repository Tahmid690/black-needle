import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import FeaturedProducts from "./components/FeaturedProducts";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. GLOBAL ANNOUNCEMENT BAR */}
      <div className="fixed top-0 left-0 right-0 h-8 bg-black text-white flex items-center justify-center z-50">
        <span className="text-[9px] sm:text-xs tracking-[0.2em] font-medium uppercase text-center">
          FREE SHIPPING NATIONWIDE | EASY 7-DAY FIT EXCHANGE
        </span>
      </div>

      {/* 2. STICKY NAVIGATION HEADER */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* 3. IMPACT HERO SECTION */}
        <section className="relative min-h-[calc(100vh-2rem)] flex items-center bg-neutral-900 overflow-hidden mt-8">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero.png"
              alt="Black Needle flagship button-down shirt editorial styled on model"
              fill
              priority
              className="object-cover object-center brightness-75"
            />
            {/* Dark editorial overlay for text contrast and premium feel */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Hero Text Overlay Content */}
          <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-start h-full">
            <div className="max-w-xl bg-black/85 backdrop-blur-md p-8 sm:p-12 border border-neutral-800 shadow-2xl text-left">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-neutral-400 block mb-3">
                ORIGINAL ARCHITECTURE
              </span>
              <h1 className="text-3xl sm:text-5xl font-light tracking-[0.1em] text-white uppercase font-serif leading-tight">
                THE PERFECT FIT.
              </h1>
              <p className="mt-6 text-xs sm:text-sm text-neutral-300 font-normal tracking-widest leading-relaxed uppercase">
                Meticulously tailored shirts crafted from hand-selected premium fabrics. Designed to fit clean, construct sharp, and wear effortless.
              </p>
              <div className="mt-8">
                <Link
                  href="#new-drops"
                  className="inline-block bg-white hover:bg-black border border-white hover:border-white text-black hover:text-white text-[11px] font-bold tracking-[0.2em] px-8 py-4 uppercase transition-all duration-300 shadow-sm"
                >
                  EXPLORE THE SHIRTS
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CURRENT DROPS PRODUCT ROW */}
        <FeaturedProducts />

        {/* 6. FABRIC & TRUST HIGHLIGHT SECTION */}
        <section className="py-24 bg-neutral-50 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Panel: Close-up textile image */}
              <div className="relative aspect-[3/4] lg:aspect-[4/5] bg-white overflow-hidden shadow-sm border border-neutral-200">
                <Image
                  src="/images/yarn_weave.png"
                  alt="Premium cotton and linen yarn weave structures close-up view"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              {/* Right Panel: Trust parameters */}
              <div className="space-y-12">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-neutral-400 block mb-2">
                    WE BUILD TO LAST
                  </span>
                  <h2 className="text-3xl font-light tracking-widest text-neutral-900 uppercase font-serif">
                    Fabric & Trust
                  </h2>
                </div>

                <div className="space-y-8">
                  {/* Parameter 1 */}
                  <div className="border-l border-neutral-900 pl-6 py-2">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-2">
                      01 / Tailored Specs
                    </h3>
                    <p className="text-xs text-neutral-600 tracking-wide leading-relaxed">
                      Every single size variant is measured precisely. Exact shoulder widths, chest lengths, and sleeve measurements are documented inside the product options to ensure a flawless fit standard.
                    </p>
                  </div>

                  {/* Parameter 2 */}
                  <div className="border-l border-neutral-900 pl-6 py-2">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-2">
                      02 / Zero Passwords
                    </h3>
                    <p className="text-xs text-neutral-600 tracking-wide leading-relaxed">
                      Experience secure authentication. Gain immediate entry to your customer orders, tracking details, and saved sizing profiles using your phone number via passwordless SMS OTP.
                    </p>
                  </div>

                  {/* Parameter 3 */}
                  <div className="border-l border-neutral-900 pl-6 py-2">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-2">
                      03 / Luxury Textiles
                    </h3>
                    <p className="text-xs text-neutral-600 tracking-wide leading-relaxed">
                      We exclusively source premium fibers, Egyptian cotton, and organic long-staple linen. Each fabric choice undergoes rigorous testing to preserve shape, color intensity, and structure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 7. THE MINIMALIST FOOTER */}
      <footer className="bg-white border-t border-neutral-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Column 1: Brand statement */}
            <div className="space-y-4">
              <span className="text-sm font-bold tracking-[0.25em] text-neutral-900 block">
                BLACK NEEDLE
              </span>
              <p className="text-[11px] text-neutral-500 tracking-wide leading-relaxed max-w-xs uppercase">
                Constructed minimalist apparel for modern men. Built on structural architecture, textile perfection, and tailored fitting limits.
              </p>
            </div>

            {/* Column 2: Shop Paths */}
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-widest uppercase text-neutral-900 block">
                Shop Paths
              </span>
              <ul className="space-y-2 text-[11px] uppercase tracking-wider text-neutral-500">
                <li>
                  <Link href="#new-drops" className="hover:text-neutral-900 transition-colors">
                    New Drops
                  </Link>
                </li>
                <li>
                  <Link href="#casual-shirts" className="hover:text-neutral-900 transition-colors">
                    Casual Shirts
                  </Link>
                </li>
                <li>
                  <Link href="#formal-shirts" className="hover:text-neutral-900 transition-colors">
                    Formal Dress
                  </Link>
                </li>
                <li>
                  <Link href="#premium-linen" className="hover:text-neutral-900 transition-colors">
                    Premium Linen
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Customer Help */}
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-widest uppercase text-neutral-900 block">
                Customer Help
              </span>
              <ul className="space-y-2 text-[11px] uppercase tracking-wider text-neutral-500">
                <li>
                  <Link href="#" className="hover:text-neutral-900 transition-colors">
                    Fits & Measurements
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-neutral-900 transition-colors">
                    Easy Fit Exchange
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-neutral-900 transition-colors">
                    Shipping & Tracking
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-neutral-900 transition-colors">
                    Submit Query
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Connect */}
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-widest uppercase text-neutral-900 block">
                Connect
              </span>
              <ul className="space-y-2 text-[11px] uppercase tracking-wider text-neutral-500">
                <li>
                  <a href="#" className="hover:text-neutral-900 transition-colors flex items-center space-x-2">
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-neutral-900 transition-colors flex items-center space-x-2">
                    <span>Facebook</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-neutral-900 transition-colors flex items-center space-x-2">
                    <span>WhatsApp</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-neutral-100 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-widest text-neutral-400">
            <span>© {new Date().getFullYear()} BLACK NEEDLE APPAREL. ALL RIGHTS RESERVED.</span>
            <span className="mt-2 sm:mt-0">DESIGNED FOR PERFECTION</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
