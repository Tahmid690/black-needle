import Link from 'next/link';
import ProductForm from '../../../components/ProductForm';

export default function NewProductPage() {
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
            ADD ARCHITECTURE
          </span>
          <h1 className="text-3xl font-light uppercase tracking-[0.1em] text-neutral-900 font-serif">
            New Product
          </h1>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
