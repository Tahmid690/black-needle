'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VariantInput {
  id?: string;
  size: string;
  stock: number;
  sku: string;
  images: string; // Comma-separated string for editing, split on submit
  sizeMeasurements: Record<string, string>;
}

interface ProductFormProps {
  initialProduct?: {
    id: string;
    name: string;
    color: string;
    description: string | null;
    basePrice: string;
    type: 'shirts' | 'pants' | 'outerwear' | 'footwear' | 'accessories';
    subcategory: string;
    fabricDetails: string | null;
    isActive: number;
    variants: Array<{
      id: string;
      size: string;
      stock: number;
      sku: string;
      images: any;
      sizeMeasurements: any;
    }>;
  };
}

export default function ProductForm({ initialProduct }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialProduct;

  // 1. General product state
  const [name, setName] = useState(initialProduct?.name || '');
  const [color, setColor] = useState(initialProduct?.color || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [basePrice, setBasePrice] = useState(initialProduct?.basePrice || '');
  const [type, setType] = useState<string>(
    initialProduct?.type || 'shirts'
  );
  const [subcategory, setSubcategory] = useState(initialProduct?.subcategory || '');
  const [fabricDetails, setFabricDetails] = useState(initialProduct?.fabricDetails || '');
  const [isActive, setIsActive] = useState(initialProduct?.isActive ?? 1);

  // 2. Variants state
  // Pre-populate with S, M, L, XL for new products
  const defaultVariants: VariantInput[] = [
    { size: 'S', stock: 10, sku: '', images: '/images/hero.png', sizeMeasurements: {} },
    { size: 'M', stock: 10, sku: '', images: '/images/hero.png', sizeMeasurements: {} },
    { size: 'L', stock: 10, sku: '', images: '/images/hero.png', sizeMeasurements: {} },
    { size: 'XL', stock: 5, sku: '', images: '/images/hero.png', sizeMeasurements: {} },
  ];

  const initialVariantsState: VariantInput[] = initialProduct
    ? initialProduct.variants.map((v) => ({
        id: v.id,
        size: v.size,
        stock: v.stock,
        sku: v.sku,
        images: Array.isArray(v.images) ? v.images.join(', ') : '',
        sizeMeasurements: (v.sizeMeasurements as Record<string, string>) || {},
      }))
    : defaultVariants;

  const [variants, setVariants] = useState<VariantInput[]>(initialVariantsState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get measurement keys based on product type
  function getMeasurementFields(productType: string) {
    if (productType === 'shirts' || productType === 'outerwear') {
      return [
        { key: 'chest', label: 'Chest (in)' },
        { key: 'length', label: 'Length (in)' },
        { key: 'sleeve', label: 'Sleeve (in)' },
        { key: 'shoulder', label: 'Shoulder (in)' },
      ];
    }
    if (productType === 'pants') {
      return [
        { key: 'waist', label: 'Waist (in)' },
        { key: 'length', label: 'Length (in)' },
        { key: 'inseam', label: 'Inseam (in)' },
        { key: 'hip', label: 'Hip (in)' },
      ];
    }
    return [
      { key: 'fit', label: 'General Fit info' },
    ];
  }

  const measurementFields = getMeasurementFields(type);

  function handleVariantChange(index: number, field: keyof VariantInput, value: any) {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function handleMeasurementChange(variantIndex: number, key: string, value: string) {
    setVariants((prev) => {
      const copy = [...prev];
      const nextMeasurements = { ...copy[variantIndex].sizeMeasurements, [key]: value };
      copy[variantIndex] = { ...copy[variantIndex], sizeMeasurements: nextMeasurements };
      return copy;
    });
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { size: '', stock: 0, sku: '', images: '/images/hero.png', sizeMeasurements: {} },
    ]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    // Validate size variants
    if (variants.length === 0) {
      setError('You must define at least one size variant');
      setLoading(false);
      return;
    }

    const hasEmptySizes = variants.some((v) => !v.size.trim());
    if (hasEmptySizes) {
      setError('All variants must have a defined size (e.g. S, M, 34)');
      setLoading(false);
      return;
    }

    // Format variants payload
    const formattedVariants = variants.map((v) => ({
      id: v.id,
      size: v.size.toUpperCase().trim(),
      stock: v.stock,
      sku: v.sku.trim() || undefined,
      images: v.images
        .split(',')
        .map((img) => img.trim())
        .filter((img) => img.length > 0),
      sizeMeasurements: v.sizeMeasurements,
    }));

    const payload = {
      name: name.trim(),
      color: color.trim(),
      description: description.trim() || null,
      basePrice: parseFloat(basePrice),
      type,
      subcategory: subcategory.trim(),
      fabricDetails: fabricDetails.trim() || null,
      isActive,
      variants: formattedVariants,
    };

    try {
      const url = isEdit ? `/api/admin/products/${initialProduct.id}` : '/api/admin/products';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        setError(data.error || 'Failed to save product');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please check connection.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3 flex items-center space-x-2">
          <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-bold tracking-wide uppercase text-[10px]">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: General Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 pb-4 border-b border-neutral-100">
              Product Details
            </h3>

            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                Product Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs tracking-wider uppercase focus:outline-none focus:border-neutral-900 transition-colors bg-white text-neutral-900"
                placeholder="e.g. Premium Linen Shirt"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Color */}
              <div>
                <label htmlFor="color" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                  Color / Shade
                </label>
                <input
                  id="color"
                  type="text"
                  required
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-200 text-xs tracking-wider focus:outline-none focus:border-neutral-900 transition-colors bg-white text-neutral-900"
                  placeholder="e.g. Ivory White"
                />
              </div>

              {/* Base Price */}
              <div>
                <label htmlFor="basePrice" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                  Base Price (BDT)
                </label>
                <input
                  id="basePrice"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono tracking-wider focus:outline-none focus:border-neutral-900 transition-colors bg-white text-neutral-900"
                  placeholder="2450.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Type */}
              <div>
                <label htmlFor="type" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                  Product Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-neutral-200 text-xs tracking-wider uppercase focus:outline-none focus:border-neutral-900 transition-colors bg-white text-neutral-900"
                >
                  <option value="shirts">Shirts</option>
                  <option value="pants">Pants</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="footwear">Footwear</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label htmlFor="subcategory" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                  Subcategory
                </label>
                <input
                  id="subcategory"
                  type="text"
                  required
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-200 text-xs tracking-wider focus:outline-none focus:border-neutral-900 transition-colors bg-white text-neutral-900"
                  placeholder="e.g. Casual Wear"
                />
              </div>
            </div>

            {/* Fabric Details */}
            <div>
              <label htmlFor="fabricDetails" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                Fabric Details
              </label>
              <input
                id="fabricDetails"
                type="text"
                value={fabricDetails}
                onChange={(e) => setFabricDetails(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs tracking-wider focus:outline-none focus:border-neutral-900 transition-colors bg-white text-neutral-900"
                placeholder="e.g. 100% Organic French Linen, 140 GSM"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs tracking-wider focus:outline-none focus:border-neutral-900 transition-colors bg-white text-neutral-900"
                placeholder="Meticulously tailored for a relaxed fit, complete with mother-of-pearl buttons..."
              />
            </div>
          </div>
        </div>

        {/* Right Side: Options & Status */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 pb-4 border-b border-neutral-100">
              Publish Status
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Visible on Storefront
              </span>
              <button
                type="button"
                onClick={() => setIsActive(isActive === 1 ? 0 : 1)}
                className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 border transition-all ${
                  isActive === 1
                    ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'
                    : 'bg-white text-neutral-400 border-neutral-200 hover:text-neutral-600'
                }`}
              >
                {isActive === 1 ? 'Published' : 'Draft / Hidden'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 pb-4 border-b border-neutral-100 mb-4">
              Form Actions
            </h3>
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold tracking-widest py-4 px-6 uppercase transition-colors disabled:bg-neutral-400"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="w-full bg-white border border-neutral-200 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 text-xs font-bold tracking-widest py-4 px-6 uppercase transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sizing & Variants Details */}
      <div className="bg-white border border-neutral-200 p-6">
        <div className="flex justify-between items-center pb-4 border-b border-neutral-100 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
            Size Variants & Inventory
          </h3>
          <button
            type="button"
            onClick={addVariant}
            className="text-[10px] font-bold uppercase tracking-widest border border-neutral-200 hover:border-neutral-900 text-neutral-500 hover:text-neutral-900 px-4 py-2 transition-all"
          >
            Add Size Variant
          </button>
        </div>

        <div className="space-y-8 divide-y divide-neutral-100">
          {variants.map((variant, vIdx) => (
            <div key={vIdx} className="pt-6 first:pt-0 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-700">
                  Variant #{vIdx + 1} {variant.size ? `(Size ${variant.size})` : ''}
                </h4>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(vIdx)}
                    className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove Variant
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Size */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    Size
                  </label>
                  <input
                    type="text"
                    required
                    value={variant.size}
                    onChange={(e) => handleVariantChange(vIdx, 'size', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 text-xs tracking-wider uppercase focus:outline-none focus:border-neutral-900 bg-white text-neutral-900"
                    placeholder="e.g. M, L, 32"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    Live Stock
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(vIdx, 'stock', parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-neutral-200 text-xs font-mono tracking-wider focus:outline-none focus:border-neutral-900 bg-white text-neutral-900"
                    placeholder="10"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    SKU (Optional)
                  </label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(vIdx, 'sku', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 text-xs font-mono tracking-wider uppercase focus:outline-none focus:border-neutral-900 bg-white text-neutral-900"
                    placeholder="Auto-generated if blank"
                  />
                </div>

                {/* Image paths */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    Image paths (separated by comma)
                  </label>
                  <input
                    type="text"
                    value={variant.images}
                    onChange={(e) => handleVariantChange(vIdx, 'images', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 text-xs tracking-wider focus:outline-none focus:border-neutral-900 bg-white text-neutral-900"
                    placeholder="/images/white_shirt.png"
                  />
                </div>
              </div>

              {/* Dynamic Sizing Measurements */}
              <div className="bg-neutral-50 p-4 border border-neutral-100">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                  Sizing Architecture Measurements
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {measurementFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={variant.sizeMeasurements[field.key] || ''}
                        onChange={(e) => handleMeasurementChange(vIdx, field.key, e.target.value)}
                        className="w-full px-3 py-1.5 border border-neutral-200 text-xs tracking-wider focus:outline-none focus:border-neutral-900 bg-white text-neutral-900"
                        placeholder="e.g. 44 in or Relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
