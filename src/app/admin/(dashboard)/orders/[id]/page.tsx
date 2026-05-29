import { db } from '@/db';
import { orders, orderItems, productVariants, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusDropdown from '../../../components/StatusDropdown';
import PaymentStatusToggle from '../../../components/PaymentStatusToggle';
import TrackingNumberInput from '../../../components/TrackingNumberInput';

export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  // 1. Fetch the order
  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id));

  if (orderRows.length === 0) {
    notFound();
  }

  const order = orderRows[0];

  // 2. Fetch order items with variant and product info
  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
      size: productVariants.size,
      images: productVariants.images,
      sku: productVariants.sku,
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

  return (
    <div className="space-y-8">
      {/* Back button and header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors mb-3 font-semibold"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Orders</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-1">
              Order Details
            </span>
            <h1 className="text-xl font-mono font-bold tracking-tight text-neutral-900 break-all">
              {order.id}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-white border border-neutral-200 p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 pr-2 border-r border-neutral-200">
                Payment
              </span>
              <PaymentStatusToggle orderId={order.id} initialPaymentStatus={order.paymentStatus} />
            </div>
            <div className="flex items-center space-x-2 bg-white border border-neutral-200 p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 pr-2 border-r border-neutral-200">
                Status
              </span>
              <StatusDropdown orderId={order.id} initialStatus={order.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Order items & Summary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white border border-neutral-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-6 pb-4 border-b border-neutral-100">
              Items Ordered
            </h3>
            
            <div className="divide-y divide-neutral-100">
              {items.map((item) => {
                const imageArr = Array.isArray(item.images) ? item.images : [];
                const imageSrc = imageArr[0] ?? "/images/hero.png";
                
                return (
                  <div key={item.id} className="flex items-start space-x-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-14 h-[72px] bg-neutral-50 border border-neutral-100 overflow-hidden flex-shrink-0">
                      <img
                        src={imageSrc}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 truncate">
                        {item.productName}
                      </h4>
                      <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wide font-semibold">
                        Color: {item.productColor} · Size: {item.size}
                      </p>
                      <p className="text-[9px] font-mono text-neutral-400 tracking-wider uppercase mt-1">
                        SKU: {item.sku}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-neutral-900 tracking-wider">
                        {Number(item.priceAtPurchase).toLocaleString()} BDT
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-1">
                        Qty {item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-neutral-100 mt-6 pt-6 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500 uppercase tracking-wider font-semibold">Subtotal</span>
                <span className="font-bold text-neutral-900 font-mono">
                  {Number(order.totalAmount).toLocaleString()} BDT
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500 uppercase tracking-wider font-semibold">Shipping</span>
                <span className="font-bold text-neutral-900 uppercase tracking-widest text-[10px]">Free</span>
              </div>
              <div className="flex justify-between text-sm border-t border-neutral-100 pt-3">
                <span className="font-bold text-neutral-900 uppercase tracking-wider">Grand Total</span>
                <span className="font-bold text-neutral-900 font-mono text-base">
                  {Number(order.totalAmount).toLocaleString()} BDT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Shipping & Fulfillment info */}
        <div className="space-y-8">
          {/* Shipping Address */}
          <div className="bg-white border border-neutral-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-6 pb-4 border-b border-neutral-100">
              Customer Information
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold block mb-1">
                  Recipient Name
                </span>
                <span className="font-bold text-neutral-900 uppercase tracking-wide">
                  {shippingAddr.name}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold block mb-1">
                  Phone Number
                </span>
                <a
                  href={`tel:${shippingAddr.phone}`}
                  className="font-bold text-neutral-900 hover:underline hover:text-neutral-600"
                >
                  {shippingAddr.phone}
                </a>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold block mb-1">
                  City
                </span>
                <span className="font-bold text-neutral-900 uppercase tracking-wide">
                  {shippingAddr.city}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold block mb-1">
                  Delivery Address
                </span>
                <span className="font-medium text-neutral-700 leading-relaxed block">
                  {shippingAddr.addressLine}
                </span>
              </div>
            </div>
          </div>

          {/* Fulfillment Tracking */}
          <div className="bg-white border border-neutral-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-6 pb-4 border-b border-neutral-100">
              Fulfillment
            </h3>
            <TrackingNumberInput orderId={order.id} initialTrackingNumber={order.trackingNumber} />
          </div>
        </div>
      </div>
    </div>
  );
}
