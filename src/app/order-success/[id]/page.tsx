import { db } from "@/db";
import { orders, orderItems, productVariants, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = await params;

  // Fetch the order from database
  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id));

  if (orderRows.length === 0) {
    notFound();
  }

  const order = orderRows[0];

  // Fetch order items with variant + product details
  const items = await db
    .select({
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
      size: productVariants.size,
      images: productVariants.images,
      productName: products.name,
      productColor: products.color,
    })
    .from(orderItems)
    .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(orderItems.orderId, id));

  const shippingAddr = order.shippingAddress as {
    name: string;
    phone: string;
    city: string;
    addressLine: string;
  };

  const statusColor: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    processing: "bg-blue-50 text-blue-800 border-blue-200",
    shipped: "bg-indigo-50 text-indigo-800 border-indigo-200",
    delivered: "bg-green-50 text-green-800 border-green-200",
    cancelled: "bg-red-50 text-red-800 border-red-200",
  };

  const statusLabel: Record<string, string> = {
    pending: "Awaiting Processing",
    processing: "Being Prepared",
    shipped: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement bar */}
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
        <Link
          href="/"
          className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <svg className="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Continue Shopping</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-14 lg:py-20">
        {/* Success Header */}
        <div className="text-center mb-14">
          <div className="w-14 h-14 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-white stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-3">
            ORDER CONFIRMED
          </span>
          <h1 className="text-2xl sm:text-4xl font-light uppercase tracking-[0.15em] text-neutral-900 font-serif">
            Thank You.
          </h1>
          <p className="mt-3 text-xs text-neutral-500 tracking-widest uppercase font-medium max-w-sm mx-auto">
            Your order has been received. We'll start preparing it right away.
          </p>
        </div>

        {/* Order ID Card */}
        <div className="border border-neutral-200 bg-neutral-50/50 p-6 mb-8 text-center">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">
            Order Reference
          </p>
          <p className="text-sm font-mono font-bold text-neutral-900 tracking-wider break-all">
            {order.id}
          </p>
          <div className="mt-4 inline-flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${statusColor[order.status] ?? "bg-neutral-100 text-neutral-700 border-neutral-200"}`}
            >
              {statusLabel[order.status] ?? order.status}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${order.paymentStatus === "paid" ? "bg-green-50 text-green-800 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}
            >
              {order.paymentStatus === "paid" ? "Payment Confirmed" : "Cash on Delivery"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          {/* Shipping Info */}
          <div className="border border-neutral-100 p-6">
            <h2 className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-4 border-b border-neutral-100 pb-3">
              Delivering To
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-bold tracking-wide text-neutral-900">{shippingAddr.name}</p>
              <p className="text-xs text-neutral-600 tracking-wide">{shippingAddr.phone}</p>
              <p className="text-xs text-neutral-600 tracking-wide">{shippingAddr.addressLine}</p>
              <p className="text-xs text-neutral-600 tracking-wide">{shippingAddr.city}</p>
            </div>
          </div>

          {/* Payment & Shipping */}
          <div className="border border-neutral-100 p-6">
            <h2 className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-4 border-b border-neutral-100 pb-3">
              Payment & Delivery
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-xs tracking-wide">
                <span className="text-neutral-500 uppercase font-medium">Payment</span>
                <span className="font-bold text-neutral-900 uppercase tracking-widest">Cash on Delivery</span>
              </div>
              <div className="flex justify-between text-xs tracking-wide">
                <span className="text-neutral-500 uppercase font-medium">Shipping</span>
                <span className="font-bold text-neutral-900 uppercase tracking-widest">Free</span>
              </div>
              <div className="flex justify-between text-xs tracking-wide border-t border-neutral-100 pt-3">
                <span className="text-neutral-500 uppercase font-bold">Grand Total</span>
                <span className="font-bold text-neutral-900 tracking-wider">
                  {Number(order.totalAmount).toLocaleString()} BDT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="border border-neutral-100">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="text-[10px] uppercase tracking-widest text-neutral-900 font-bold">
              Items Ordered
            </h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {items.map((item, i) => {
              const imageArr = Array.isArray(item.images) ? item.images : [];
              const imageSrc = imageArr[0] ?? "/images/hero.png";

              return (
                <div key={i} className="flex items-start space-x-4 p-5">
                  <div className="w-14 h-[72px] bg-neutral-50 border border-neutral-100 overflow-hidden flex-shrink-0">
                    <img
                      src={imageSrc}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      {item.productName}
                    </h3>
                    <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wide font-medium">
                      {item.productColor} · Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-neutral-900 tracking-wider flex-shrink-0">
                    {(Number(item.priceAtPurchase) * item.quantity).toLocaleString()} BDT
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-10 text-center space-y-4">
          <p className="text-xs text-neutral-500 tracking-widest uppercase">
            Need help? Contact us on WhatsApp or Instagram for order support.
          </p>
          <Link
            href="/"
            className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold tracking-widest py-4 px-10 uppercase transition-colors"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </main>
    </div>
  );
}
