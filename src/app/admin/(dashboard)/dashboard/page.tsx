import { db } from '@/db';
import { orders, products, productVariants } from '@/db/schema';
import { sum, count, eq, and, gte, lt, ne, desc } from 'drizzle-orm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Total Revenue (all time, excluding cancelled)
  const totalRevResult = await db
    .select({ value: sum(orders.totalAmount) })
    .from(orders)
    .where(ne(orders.status, 'cancelled'));
  const totalRevenue = Number(totalRevResult[0]?.value || 0);

  // 2. Revenue This Month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthRevResult = await db
    .select({ value: sum(orders.totalAmount) })
    .from(orders)
    .where(and(ne(orders.status, 'cancelled'), gte(orders.createdAt, startOfMonth)));
  const monthRevenue = Number(monthRevResult[0]?.value || 0);

  // 3. Orders Today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const ordersTodayResult = await db
    .select({ count: count() })
    .from(orders)
    .where(gte(orders.createdAt, startOfToday));
  const ordersToday = ordersTodayResult[0]?.count || 0;

  // 4. Orders This Month
  const ordersMonthResult = await db
    .select({ count: count() })
    .from(orders)
    .where(gte(orders.createdAt, startOfMonth));
  const ordersMonth = ordersMonthResult[0]?.count || 0;

  // 5. Pending Orders (action required)
  const pendingOrdersResult = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.status, 'pending'));
  const pendingOrders = pendingOrdersResult[0]?.count || 0;

  // 6. Total Products
  const totalProductsResult = await db
    .select({ count: count() })
    .from(products);
  const totalProducts = totalProductsResult[0]?.count || 0;

  // 7. Low Stock Count
  const lowStockResult = await db
    .select({ count: count() })
    .from(productVariants)
    .where(lt(productVariants.stock, 5));
  const lowStockCount = lowStockResult[0]?.count || 0;

  // 8. Recent Orders
  const recentOrders = await db
    .select({
      id: orders.id,
      totalAmount: orders.totalAmount,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
      shippingAddress: orders.shippingAddress,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(8);

  // 9. Last 7 Days Daily Revenue Chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const startOf7DaysAgo = new Date();
  startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6);
  startOf7DaysAgo.setHours(0, 0, 0, 0);

  const last7DaysOrders = await db
    .select({
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(ne(orders.status, 'cancelled'), gte(orders.createdAt, startOf7DaysAgo)));

  const dailyRevenueMap = new Map<string, number>();
  last7Days.forEach(date => {
    const key = date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    dailyRevenueMap.set(key, 0);
  });

  last7DaysOrders.forEach(order => {
    const dateKey = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    if (dailyRevenueMap.has(dateKey)) {
      dailyRevenueMap.set(dateKey, dailyRevenueMap.get(dateKey)! + Number(order.totalAmount));
    }
  });

  const chartData = Array.from(dailyRevenueMap.entries()).map(([label, value]) => ({
    label,
    value,
  }));

  const maxRevenue = Math.max(...chartData.map(d => d.value), 1);

  // 10. Low Stock Variants List
  const lowStockVariants = await db
    .select({
      id: productVariants.id,
      size: productVariants.size,
      stock: productVariants.stock,
      sku: productVariants.sku,
      productName: products.name,
      productColor: products.color,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(lt(productVariants.stock, 5))
    .orderBy(productVariants.stock)
    .limit(5);

  const orderStatusLabel: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const statusBadgeStyle: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    processing: "bg-blue-50 text-blue-800 border-blue-200",
    shipped: "bg-indigo-50 text-indigo-800 border-indigo-200",
    delivered: "bg-green-50 text-green-800 border-green-200",
    cancelled: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-1">
          MANAGEMENT OVERVIEW
        </span>
        <h1 className="text-3xl font-light uppercase tracking-[0.1em] text-neutral-900 font-serif">
          Dashboard
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Total Revenue
          </span>
          <div className="mt-4">
            <span className="text-2xl font-light tracking-wide text-neutral-900 font-serif">
              {totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500 font-bold ml-1 uppercase tracking-widest">
              BDT
            </span>
          </div>
          <span className="text-[9px] text-neutral-400 mt-2 block tracking-wider uppercase font-semibold">
            All-time sales (excl. cancelled)
          </span>
        </div>

        {/* Revenue This Month */}
        <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Revenue This Month
          </span>
          <div className="mt-4">
            <span className="text-2xl font-light tracking-wide text-neutral-900 font-serif">
              {monthRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500 font-bold ml-1 uppercase tracking-widest">
              BDT
            </span>
          </div>
          <span className="text-[9px] text-neutral-400 mt-2 block tracking-wider uppercase font-semibold">
            {ordersMonth} Orders this month
          </span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Pending Orders
          </span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-light tracking-wide text-neutral-900 font-serif">
              {pendingOrders}
            </span>
            {pendingOrders > 0 && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                Action Required
              </span>
            )}
          </div>
          <span className="text-[9px] text-neutral-400 mt-2 block tracking-wider uppercase font-semibold">
            {ordersToday} Orders placed today
          </span>
        </div>

        {/* Total Products & Low Stock */}
        <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Inventory Health
          </span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-light tracking-wide text-neutral-900 font-serif">
              {totalProducts} <span className="text-xs text-neutral-400 font-sans tracking-widest font-normal uppercase">Products</span>
            </span>
            {lowStockCount > 0 && (
              <span className="bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                {lowStockCount} Low Stock
              </span>
            )}
          </div>
          <span className="text-[9px] text-neutral-400 mt-2 block tracking-wider uppercase font-semibold">
            Variants with stock &lt; 5
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white border border-neutral-200 p-6 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-6 pb-4 border-b border-neutral-100">
            Weekly Performance (Last 7 Days)
          </h3>
          <div className="h-64 flex items-end justify-between border-b border-neutral-200 pb-2 pt-6">
            {chartData.map((d, index) => {
              const heightPercent = (d.value / maxRevenue) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  <span className="text-[9px] font-bold text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity mb-2 font-mono">
                    {d.value.toLocaleString()}
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    className="w-6 sm:w-10 bg-neutral-900 group-hover:bg-neutral-800 transition-all duration-300 relative"
                  >
                    <div className="absolute inset-0 bg-neutral-950 opacity-0 group-hover:opacity-10 transition-opacity" />
                  </div>
                  <span className="text-[8px] uppercase tracking-widest text-neutral-400 mt-3 font-semibold text-center leading-none">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alerts list */}
        <div className="bg-white border border-neutral-200 p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
              Low Stock Alerts
            </h3>
            <Link
              href="/admin/inventory"
              className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Manage Stock →
            </Link>
          </div>

          {lowStockVariants.length === 0 ? (
            <div className="h-48 flex items-center justify-center border border-dashed border-neutral-200 text-xs text-neutral-400 tracking-wider uppercase font-semibold">
              All stock levels healthy
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockVariants.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-bold text-neutral-900 uppercase tracking-wide truncate">
                      {v.productName}
                    </p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5 truncate">
                      {v.productColor} · Size {v.size}
                    </p>
                    <p className="text-[9px] font-mono text-neutral-400 tracking-wider uppercase mt-0.5 truncate">
                      {v.sku}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-widest border px-2.5 py-1 ${
                    v.stock === 0
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {v.stock === 0 ? 'Out of stock' : `${v.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-neutral-200 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
            Recent Orders
          </h3>
          <Link
            href="/admin/orders"
            className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400 tracking-wider uppercase font-semibold">
            No orders placed yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Order Reference</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Customer</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Date</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Payment</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {recentOrders.map((order) => {
                  const addr = order.shippingAddress as { name: string; phone: string };
                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-4 font-mono font-bold tracking-wider text-neutral-900">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="py-4">
                        <div className="font-bold text-neutral-800 uppercase tracking-wide">{addr.name}</div>
                        <div className="text-[10px] text-neutral-500 font-medium">{addr.phone}</div>
                      </td>
                      <td className="py-4 text-neutral-600 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 uppercase tracking-widest text-[9px] font-bold">
                        {order.paymentStatus === 'paid' ? (
                          <span className="text-green-800 bg-green-50 border border-green-200 px-2 py-0.5">Paid</span>
                        ) : (
                          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5">COD</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-bold uppercase tracking-widest ${statusBadgeStyle[order.status] || 'bg-neutral-100 text-neutral-700'}`}>
                          {orderStatusLabel[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-neutral-900 font-mono">
                        {Number(order.totalAmount).toLocaleString()} BDT
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
