import { db } from '@/db';
import { products, productVariants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductForm from '../../../components/ProductForm';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  // 1. Fetch product
  const productRows = await db
    .select()
    .from(products)
    .where(eq(products.id, id));

  if (productRows.length === 0) {
    notFound();
  }

  const product = productRows[0];

  // 2. Fetch variants
  const variantsList = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id));

  // 3. Format product for form
  const formattedProduct = {
    id: product.id,
    name: product.name,
    color: product.color,
    description: product.description,
    basePrice: product.basePrice,
    type: product.type as any,
    subcategory: product.subcategory,
    fabricDetails: product.fabricDetails,
    isActive: product.isActive,
    variants: variantsList.map((v) => ({
      id: v.id,
      size: v.size,
      stock: v.stock,
      sku: v.sku,
      images: v.images,
      sizeMeasurements: v.sizeMeasurements,
    })),
  };

  return (
    <div className="space-y-8">
      {/* Back button and header */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors mb-3 font-semibold"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Catalogue</span>
        </Link>

        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-1">
            EDIT ARCHITECTURE
          </span>
          <h1 className="text-3xl font-light uppercase tracking-[0.1em] text-neutral-900 font-serif">
            Edit Product
          </h1>
        </div>
      </div>

      <ProductForm initialProduct={formattedProduct} />
    </div>
  );
}
