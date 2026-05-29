import { db } from '@/db';
import { users, orders } from '@/db/schema';
import { eq, count, sum, sql, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  // Query all customers and aggregate order counts + lifetime spent
  const customerList = await db
    .select({
      id: users.id,
      name: users.name,
      phoneNumber: users.phoneNumber,
      createdAt: users.createdAt,
      orderCount: count(orders.id),
      totalSpent: sql<string>`coalesce(sum(${orders.totalAmount}), 0.00)`,
    })
    .from(users)
    .leftJoin(orders, eq(users.id, orders.userId))
    .where(eq(users.role, 'customer'))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-1">
          CUSTOMER DIRECTORY
        </span>
        <h1 className="text-3xl font-light uppercase tracking-[0.1em] text-neutral-900 font-serif">
          Customers
          <span className="ml-3 text-sm text-neutral-400 font-sans tracking-widest font-normal uppercase">
            ({customerList.length} total)
          </span>
        </h1>
      </div>

      {/* Customer List Table */}
      <div className="bg-white border border-neutral-200 p-6">
        {customerList.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400 tracking-wider uppercase font-semibold border border-dashed border-neutral-200">
            No customers found in database
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Customer Details</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Phone Number</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Joined Date</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-center">Orders Count</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Lifetime Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {customerList.map((cust) => (
                    <tr key={cust.id} className="hover:bg-neutral-50/50 transition-colors">
                      {/* Name */}
                      <td className="py-4">
                        <div className="font-bold text-neutral-800 uppercase tracking-wide">
                          {cust.name}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          ID: {cust.id.slice(0, 8)}...
                        </div>
                      </td>
                      {/* Phone */}
                      <td className="py-4 font-mono font-medium text-neutral-600">
                        <a href={`tel:${cust.phoneNumber}`} className="hover:underline hover:text-neutral-900">
                          {cust.phoneNumber}
                        </a>
                      </td>
                      {/* Joined Date */}
                      <td className="py-4 text-neutral-600 font-medium">
                        {new Date(cust.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      {/* Orders Count */}
                      <td className="py-4 text-center font-bold text-neutral-800">
                        {cust.orderCount}
                      </td>
                      {/* Lifetime Spent */}
                      <td className="py-4 text-right font-bold text-neutral-900 font-mono">
                        {Number(cust.totalSpent).toLocaleString()} BDT
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {customerList.map((cust) => (
                <div key={cust.id} className="border border-neutral-100 p-4 space-y-4 bg-white shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-neutral-800 uppercase tracking-wide">{cust.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">ID: {cust.id.slice(0, 8)}...</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-0.5">Joined Date</span>
                      <div className="text-[10px] text-neutral-700 font-semibold">
                        {new Date(cust.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-3 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-1">Contact Phone</span>
                      <a href={`tel:${cust.phoneNumber}`} className="font-mono text-xs font-semibold text-neutral-900 hover:underline hover:text-neutral-600">
                        {cust.phoneNumber}
                      </a>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-1">Activity summary</span>
                      <div className="text-neutral-700 font-bold">{cust.orderCount} {cust.orderCount === 1 ? 'order' : 'orders'}</div>
                      <div className="text-xs font-bold text-neutral-900 font-mono mt-0.5">{Number(cust.totalSpent).toLocaleString()} BDT</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
