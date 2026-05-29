import { db } from '@/db';
import { products, productVariants } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import ProductActiveToggle from '../../components/ProductActiveToggle';
import ProductDeleteButton from '../../components/ProductDeleteButton';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  // Fetch all products and variants
  const rows = await db
    .select({
      product: products,
      variant: productVariants,
    })
    .from(products)
    .leftJoin(productVariants, eq(products.id, productVariants.productId))
    .orderBy(desc(products.createdAt));

  // Group by product
  const productsMap = new Map<string, {
    id: string;
    name: string;
    color: string;
    slug: string;
    basePrice: string;
    type: string;
    subcategory: string;
    isActive: number;
    variants: Array<{
      id: string;
      size: string;
      stock: number;
      sku: string;
      images: any;
    }>;
  }>();

  rows.forEach((row) => {
    const p = row.product;
    const v = row.variant;
    
    if (!productsMap.has(p.id)) {
      productsMap.set(p.id, {
        id: p.id,
        name: p.name,
        color: p.color,
        slug: p.slug,
        basePrice: p.basePrice,
        type: p.type,
        subcategory: p.subcategory,
        isActive: p.isActive,
        variants: [],
      });
    }

    if (v) {
      productsMap.get(p.id)!.variants.push({
        id: v.id,
        size: v.size,
        stock: v.stock,
        sku: v.sku,
        images: v.images,
      });
    }
  });

  const productList = Array.from(productsMap.values());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-1">
            CATALOGUE MANAGEMENT
          </span>
          <h1 className="text-3xl font-light uppercase tracking-[0.1em] text-neutral-900 font-serif">
            Products
          </h1>
        </div>
        <div>
          <Link
            href="/admin/products/new"
            className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold tracking-widest py-4 px-6 uppercase transition-colors"
          >
            Add New Product
          </Link>
        </div>
      </div>

      {/* Product List Grid */}
      <div className="bg-white border border-neutral-200 p-6">
        {productList.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400 tracking-wider uppercase font-semibold border border-dashed border-neutral-200">
            No products found in database. Create one above.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 w-16">Image</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Product details</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Type / Category</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Variants & Stock</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Price</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Visibility</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {productList.map((prod) => {
                    // Get first image of first variant
                    let imageSrc = "/images/hero.png";
                    if (prod.variants.length > 0) {
                      const firstVarImages = prod.variants[0].images;
                      const imageArr = Array.isArray(firstVarImages) ? firstVarImages : [];
                      if (imageArr.length > 0) {
                        imageSrc = imageArr[0];
                      }
                    }

                    const totalStock = prod.variants.reduce((sum, v) => sum + v.stock, 0);

                    return (
                      <tr key={prod.id} className="hover:bg-neutral-50/50 transition-colors">
                        {/* Image */}
                        <td className="py-4">
                          <div className="w-10 h-14 bg-neutral-50 border border-neutral-100 overflow-hidden flex-shrink-0">
                            <img
                              src={imageSrc}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        {/* Name & Slug */}
                        <td className="py-4 pr-4">
                          <div className="font-bold text-neutral-800 uppercase tracking-wide">{prod.name}</div>
                          <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider mt-0.5">Color: {prod.color}</div>
                          <div className="text-[9px] font-mono text-neutral-400 tracking-wider mt-0.5 truncate max-w-[200px]" title={prod.slug}>
                            {prod.slug}
                          </div>
                        </td>
                        {/* Type & Subcategory */}
                        <td className="py-4">
                          <div className="font-bold text-neutral-800 uppercase tracking-wide">{prod.type}</div>
                          <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider mt-0.5">{prod.subcategory}</div>
                        </td>
                        {/* Variants and stock details */}
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                            {prod.variants.map((v) => (
                              <span
                                key={v.id}
                                className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-mono font-bold uppercase tracking-wider ${
                                  v.stock === 0
                                    ? 'bg-red-50 text-red-700 border-red-100'
                                    : v.stock < 5
                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                    : 'bg-neutral-50 text-neutral-700 border-neutral-100'
                                }`}
                                title={`SKU: ${v.sku}`}
                              >
                                {v.size}: {v.stock}
                              </span>
                            ))}
                          </div>
                          <div className="text-[9px] text-neutral-400 uppercase tracking-widest font-semibold mt-1">
                            Total Stock: {totalStock} units
                          </div>
                        </td>
                        {/* Price */}
                        <td className="py-4 font-bold text-neutral-900 font-mono">
                          {Number(prod.basePrice).toLocaleString()} BDT
                        </td>
                        {/* Active Toggle */}
                        <td className="py-4">
                          <ProductActiveToggle productId={prod.id} initialIsActive={prod.isActive} />
                        </td>
                        {/* Actions */}
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Link
                              href={`/admin/products/${prod.id}`}
                              className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-900 px-3 py-1.5 transition-all"
                            >
                              Edit
                            </Link>
                            <ProductDeleteButton productId={prod.id} productName={prod.name} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {productList.map((prod) => {
                // Get first image of first variant
                let imageSrc = "/images/hero.png";
                if (prod.variants.length > 0) {
                  const firstVarImages = prod.variants[0].images;
                  const imageArr = Array.isArray(firstVarImages) ? firstVarImages : [];
                  if (imageArr.length > 0) {
                    imageSrc = imageArr[0];
                  }
                }

                const totalStock = prod.variants.reduce((sum, v) => sum + v.stock, 0);

                return (
                  <div key={prod.id} className="border border-neutral-100 p-4 space-y-4 bg-white shadow-xs">
                    <div className="flex space-x-4">
                      <div className="w-14 h-20 bg-neutral-50 border border-neutral-100 overflow-hidden flex-shrink-0">
                        <img
                          src={imageSrc}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-neutral-800 uppercase tracking-wide truncate">{prod.name}</div>
                        <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider mt-0.5">Color: {prod.color}</div>
                        <div className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider mt-1">{prod.type} / {prod.subcategory}</div>
                        <div className="text-xs font-bold text-neutral-900 font-mono mt-1">{Number(prod.basePrice).toLocaleString()} BDT</div>
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-3 space-y-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-1">Variants & Stock</span>
                        <div className="flex flex-wrap gap-1">
                          {prod.variants.map((v) => (
                            <span
                              key={v.id}
                              className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-mono font-bold uppercase tracking-wider ${
                                v.stock === 0
                                  ? 'bg-red-50 text-red-700 border-red-100'
                                  : v.stock < 5
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : 'bg-neutral-50 text-neutral-700 border-neutral-100'
                              }`}
                              title={`SKU: ${v.sku}`}
                            >
                              {v.size}: {v.stock}
                            </span>
                          ))}
                        </div>
                        <div className="text-[9px] text-neutral-400 uppercase tracking-widest font-semibold mt-1">
                          Total Stock: {totalStock} units
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-1">Visibility</span>
                          <ProductActiveToggle productId={prod.id} initialIsActive={prod.isActive} />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/products/${prod.id}`}
                            className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-900 px-3 py-1.5 transition-all"
                          >
                            Edit
                          </Link>
                          <ProductDeleteButton productId={prod.id} productName={prod.name} />
                        </div>
                      </div>
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
