import { db } from '@/db';
import { productVariants, products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import InventoryTable from '../../components/InventoryTable';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  // Query all product variants in DB
  const rawVariants = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      size: productVariants.size,
      stock: productVariants.stock,
      productId: productVariants.productId,
      productName: products.name,
      productColor: products.color,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .orderBy(desc(products.createdAt), productVariants.sku);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-1">
          WAREHOUSE & LOGISTICS
        </span>
        <h1 className="text-3xl font-light uppercase tracking-[0.1em] text-neutral-900 font-serif">
          Inventory
        </h1>
      </div>

      {/* Interactive Inventory Table */}
      <InventoryTable variants={rawVariants} />
    </div>
  );
}
