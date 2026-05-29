import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { eq, desc, count, sql, and } from 'drizzle-orm';
import Link from 'next/link';
import StatusDropdown from '../../components/StatusDropdown';
import PaymentStatusToggle from '../../components/PaymentStatusToggle';

export const dynamic = 'force-dynamic';

interface OrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const currentStatus = params.status || 'all';

  // 1. Calculate tab counts using group by
  const counts = {
    all: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  const groupCounts = await db
    .select({
      status: orders.status,
      count: count(),
    })
    .from(orders)
    .groupBy(orders.status);

  groupCounts.forEach((tc) => {
    if (tc.status in counts) {
      counts[tc.status as keyof typeof counts] = tc.count;
    }
    counts.all += tc.count;
  });

  // 2. Fetch filtered orders with items count
  const filterStatus = currentStatus !== 'all' ? currentStatus : undefined;
  
  const ordersList = await db
    .select({
      id: orders.id,
      totalAmount: orders.totalAmount,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
      shippingAddress: orders.shippingAddress,
      trackingNumber: orders.trackingNumber,
      itemsCount: sql<number>`cast(count(${orderItems.id}) as integer)`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(filterStatus ? eq(orders.status, filterStatus as any) : undefined)
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt));

  const tabs = [
    { key: 'all', label: 'All Orders', count: counts.all },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'processing', label: 'Processing', count: counts.processing },
    { key: 'shipped', label: 'Shipped', count: counts.shipped },
    { key: 'delivered', label: 'Delivered', count: counts.delivered },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-1">
            LOGISTICS CENTER
          </span>
          <h1 className="text-3xl font-light uppercase tracking-[0.1em] text-neutral-900 font-serif">
            Orders
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 overflow-x-auto flex">
        <div className="flex space-x-8 min-w-max pb-0.5">
          {tabs.map((tab) => {
            const isActive = currentStatus === tab.key;
            return (
              <Link
                key={tab.key}
                href={tab.key === 'all' ? '/admin/orders' : `/admin/orders?status=${tab.key}`}
                className={`pb-4 text-xs font-bold tracking-widest uppercase border-b-2 transition-all ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {tab.label}
                <span className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white border border-neutral-200 p-6">
        {ordersList.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400 tracking-wider uppercase font-semibold border border-dashed border-neutral-200">
            No orders found under {currentStatus} status
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Order Ref</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Customer Details</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Date & Time</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Items</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Payment</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Total</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {ordersList.map((order) => {
                    const addr = order.shippingAddress as { name: string; phone: string; city: string };
                    return (
                      <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                        {/* Order Ref */}
                        <td className="py-4 font-mono font-bold tracking-wider text-neutral-900">
                          <Link href={`/admin/orders/${order.id}`} className="hover:underline hover:text-neutral-600 block">
                            {order.id.slice(0, 8)}...
                          </Link>
                        </td>
                        {/* Customer Details */}
                        <td className="py-4">
                          <div className="font-bold text-neutral-800 uppercase tracking-wide">{addr.name}</div>
                          <div className="text-[10px] text-neutral-500 font-medium">{addr.phone}</div>
                          <div className="text-[9px] text-neutral-400 uppercase tracking-widest mt-0.5">{addr.city}</div>
                        </td>
                        {/* Date */}
                        <td className="py-4 text-neutral-600 font-medium">
                          <div>
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        {/* Items Count */}
                        <td className="py-4 font-medium text-neutral-700">
                          {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                        </td>
                        {/* Payment */}
                        <td className="py-4">
                          <PaymentStatusToggle orderId={order.id} initialPaymentStatus={order.paymentStatus} />
                        </td>
                        {/* Status Selector */}
                        <td className="py-4">
                          <StatusDropdown orderId={order.id} initialStatus={order.status} />
                        </td>
                        {/* Total */}
                        <td className="py-4 text-right font-bold text-neutral-900 font-mono">
                          {Number(order.totalAmount).toLocaleString()} BDT
                        </td>
                        {/* View Button */}
                        <td className="py-4 text-center">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-block text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-900 px-3 py-1.5 transition-all"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {ordersList.map((order) => {
                const addr = order.shippingAddress as { name: string; phone: string; city: string };
                return (
                  <div key={order.id} className="border border-neutral-100 p-4 space-y-4 bg-white shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-0.5">Order Ref</span>
                        <Link href={`/admin/orders/${order.id}`} className="font-mono font-bold tracking-wider text-neutral-900 hover:underline">
                          {order.id.slice(0, 8)}...
                        </Link>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-0.5">Date & Time</span>
                        <div className="text-[10px] text-neutral-700 font-semibold">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })} · {new Date(order.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-3 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-1">Customer</span>
                        <div className="font-bold text-neutral-800 uppercase tracking-wide truncate">{addr.name}</div>
                        <div className="text-[10px] text-neutral-500 font-medium">{addr.phone}</div>
                        <div className="text-[9px] text-neutral-400 uppercase tracking-widest mt-0.5">{addr.city}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-1">Summary</span>
                        <div className="text-neutral-700 font-bold">{order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}</div>
                        <div className="text-xs font-bold text-neutral-900 font-mono mt-0.5">{Number(order.totalAmount).toLocaleString()} BDT</div>
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-3 grid grid-cols-2 gap-4 items-end">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-1.5">Payment</span>
                        <PaymentStatusToggle orderId={order.id} initialPaymentStatus={order.paymentStatus} />
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-1.5 text-left md:text-right">Status</span>
                        <StatusDropdown orderId={order.id} initialStatus={order.status} />
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-3 flex justify-end">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-900 py-2.5 transition-all"
                      >
                        View Order Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
