"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "../context/CartContext";

interface Variant {
  id: string;
  sku: string;
  size: string;
  stock: number;
  sizeMeasurements: any;
  images: any;
}

interface Product {
  id: string;
  name: string;
  color: string;
  slug: string;
  basePrice: string;
  image: string;
  description: string | null;
  fabricDetails: string | null;
  variants: Variant[];
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const { addItem, setIsCartOpen } = useCart();

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    // Auto-select first available size variant
    const firstAvailable = product.variants.find((v) => v.stock > 0);
    if (firstAvailable) {
      setSelectedSizeId(firstAvailable.id);
    } else {
      setSelectedSizeId(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSelectedSizeId(null);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedSizeId) return;

    const variant = selectedProduct.variants.find((v) => v.id === selectedSizeId);
    if (!variant || variant.stock <= 0) return;

    addItem({
      productId: selectedProduct.id,
      variantId: variant.id,
      name: selectedProduct.name,
      color: selectedProduct.color,
      size: variant.size,
      price: Number(selectedProduct.basePrice),
      image: selectedProduct.image,
      maxStock: variant.stock,
    });

    handleCloseModal();
    // Automatically open cart drawer for immediate response
    setIsCartOpen(true);
  };

  const activeVariant = selectedProduct?.variants.find((v) => v.id === selectedSizeId);

  return (
    <>
      {/* 3-Column Curated Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 justify-center">
        {products.map((product) => {
          const formattedPrice = Number(product.basePrice).toLocaleString();
          const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

          return (
            <div
              key={product.id}
              onClick={() => handleOpenModal(product)}
              className="group cursor-pointer flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden border border-neutral-100 shadow-sm">
                <Image
                  src={product.image}
                  alt={`${product.name} - ${product.color}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Out of Stock banner */}
                {totalStock === 0 && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-900 border border-neutral-900 px-4 py-2">
                      Out of Stock
                    </span>
                  </div>
                )}
                
                {/* Hover Quick View Overlay */}
                {totalStock > 0 && (
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <span className="bg-white text-neutral-900 text-[10px] font-bold uppercase tracking-widest py-3 px-6 shadow-md border border-neutral-100">
                      SELECT SIZE
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="mt-6 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 font-light tracking-wide">
                    {product.color}
                  </p>
                </div>
                <div className="mt-3 text-sm font-semibold text-neutral-900 tracking-wider">
                  {formattedPrice} BDT
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium Product Details Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white max-w-4xl w-full border border-neutral-100 shadow-2xl relative flex flex-col md:flex-row my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors z-10"
              aria-label="Close details"
            >
              <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left: Product Image */}
            <div className="w-full md:w-1/2 relative aspect-[3/4] md:aspect-auto md:h-[600px] bg-neutral-50">
              <Image
                src={selectedProduct.image}
                alt={selectedProduct.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Right: Specifications & CTA */}
            <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-between h-auto md:h-[600px] overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-neutral-400 block mb-1">
                    {selectedProduct.fabricDetails ? "PREMIUM FIBERS" : "ORIGINAL FIT"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-light uppercase tracking-widest text-neutral-900 font-serif">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-medium">
                    {selectedProduct.color}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-neutral-900 mt-3 tracking-wider">
                    {Number(selectedProduct.basePrice).toLocaleString()} BDT
                  </p>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <p className="text-xs text-neutral-600 leading-relaxed tracking-wide">
                    {selectedProduct.description}
                  </p>
                )}

                {/* Fabric Details */}
                {selectedProduct.fabricDetails && (
                  <div className="border-t border-neutral-100 pt-4">
                    <h4 className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">
                      Textile Specifications
                    </h4>
                    <p className="text-xs text-neutral-700 tracking-wide font-medium">
                      {selectedProduct.fabricDetails}
                    </p>
                  </div>
                )}

                {/* Sizing selection */}
                <div className="border-t border-neutral-100 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                      Select Sizing Limits
                    </h4>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold border-b border-neutral-300 pb-0.5">
                      Fit Guide
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedProduct.variants.map((v) => {
                      const isOutOfStock = v.stock <= 0;
                      const isSelected = v.id === selectedSizeId;

                      return (
                        <button
                          key={v.id}
                          onClick={() => !isOutOfStock && setSelectedSizeId(v.id)}
                          disabled={isOutOfStock}
                          className={`text-xs font-semibold px-4 py-2 border transition-all ${
                            isOutOfStock
                              ? "border-neutral-100 text-neutral-300 cursor-not-allowed line-through"
                              : isSelected
                              ? "border-neutral-900 bg-neutral-900 text-white font-bold"
                              : "border-neutral-200 text-neutral-700 hover:border-neutral-900"
                          }`}
                        >
                          {v.size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected size measurements */}
                {activeVariant && (
                  <div className="bg-neutral-50 p-4 border border-neutral-100/60">
                    <h5 className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-2">
                      Measurements for Size {activeVariant.size}
                    </h5>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-neutral-600 uppercase tracking-wider font-semibold">
                      {Object.entries(activeVariant.sizeMeasurements as Record<string, string>).map(
                        ([name, value]) => (
                          <div key={name} className="flex justify-between">
                            <span className="text-neutral-400">{name}:</span>
                            <span className="text-neutral-900">{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="border-t border-neutral-100 pt-6 mt-6">
                {activeVariant && activeVariant.stock < 5 && activeVariant.stock > 0 && (
                  <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold mb-3 text-center animate-pulse">
                    ⚠️ Limited Release — Only {activeVariant.stock} left in this size!
                  </p>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSizeId || (activeVariant && activeVariant.stock <= 0)}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-100 text-white disabled:text-neutral-400 text-xs font-bold tracking-widest py-4 uppercase transition-colors disabled:cursor-not-allowed"
                >
                  {activeVariant
                    ? activeVariant.stock <= 0
                      ? "OUT OF STOCK"
                      : "ADD TO ARCHIVE CART"
                    : "SELECT A SIZE"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
