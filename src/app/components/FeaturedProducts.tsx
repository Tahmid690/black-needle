import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProductGrid from "./ProductGrid";

interface DisplayProduct {
  id: string;
  name: string;
  color: string;
  slug: string;
  description: string | null;
  basePrice: string;
  fabricDetails: string | null;
  image: string;
  variants: {
    id: string;
    sku: string;
    size: string;
    stock: number;
    sizeMeasurements: any;
    images: any;
  }[];
}

// Fallback dummy products matching the 3 curated items in database
const FALLBACK_PRODUCTS: DisplayProduct[] = [
  {
    id: "fb-1",
    name: "Classic Oxford Shirt",
    color: "Midnight Black",
    slug: "classic-oxford-shirt-midnight-black",
    description: "A timeless Oxford shirt crafted from 100% premium cotton. Structured collar, chest pocket, and a relaxed fit that works from office to weekend.",
    basePrice: "4500.00",
    fabricDetails: "100% Premium Egyptian Cotton, 120 GSM",
    image: "/images/hero.png",
    variants: [
      { id: "fb-1-s", sku: "FB1-S", size: "S", stock: 8, sizeMeasurements: { chest: "38 in", length: "28 in", sleeve: "23.5 in", shoulder: "16 in" }, images: ["/images/hero.png"] },
      { id: "fb-1-m", sku: "FB1-M", size: "M", stock: 10, sizeMeasurements: { chest: "40 in", length: "29 in", sleeve: "24 in", shoulder: "17 in" }, images: ["/images/hero.png"] },
      { id: "fb-1-l", sku: "FB1-L", size: "L", stock: 6, sizeMeasurements: { chest: "42 in", length: "30 in", sleeve: "24.5 in", shoulder: "18 in" }, images: ["/images/hero.png"] },
      { id: "fb-1-xl", sku: "FB1-XL", size: "XL", stock: 4, sizeMeasurements: { chest: "44 in", length: "31 in", sleeve: "25 in", shoulder: "19 in" }, images: ["/images/hero.png"] },
    ],
  },
  {
    id: "fb-2",
    name: "Classic Oxford Shirt",
    color: "Arctic White",
    slug: "classic-oxford-shirt-arctic-white",
    description: "A timeless Oxford shirt crafted from 100% premium cotton. Structured collar, chest pocket, and a relaxed fit that works from office to weekend.",
    basePrice: "4500.00",
    fabricDetails: "100% Premium Egyptian Cotton, 120 GSM",
    image: "/images/formal.png",
    variants: [
      { id: "fb-2-s", sku: "FB2-S", size: "S", stock: 5, sizeMeasurements: { chest: "38 in", length: "28 in", sleeve: "23.5 in", shoulder: "16 in" }, images: ["/images/formal.png"] },
      { id: "fb-2-m", sku: "FB2-M", size: "M", stock: 7, sizeMeasurements: { chest: "40 in", length: "29 in", sleeve: "24 in", shoulder: "17 in" }, images: ["/images/formal.png"] },
      { id: "fb-2-l", sku: "FB2-L", size: "L", stock: 3, sizeMeasurements: { chest: "42 in", length: "30 in", sleeve: "24.5 in", shoulder: "18 in" }, images: ["/images/formal.png"] },
      { id: "fb-2-xl", sku: "FB2-XL", size: "XL", stock: 0, sizeMeasurements: { chest: "44 in", length: "31 in", sleeve: "25 in", shoulder: "19 in" }, images: ["/images/formal.png"] },
    ],
  },
  {
    id: "fb-3",
    name: "Premium Linen Button-Down",
    color: "Sahara Sand",
    slug: "premium-linen-button-down-sahara-sand",
    description: "Breathable linen weave with a slightly relaxed silhouette. Perfect for warm days — the fabric softens beautifully with every wash.",
    basePrice: "5200.00",
    fabricDetails: "55% Linen, 45% Cotton, 130 GSM",
    image: "/images/casual.png",
    variants: [
      { id: "fb-3-s", sku: "FB3-S", size: "S", stock: 4, sizeMeasurements: { chest: "38 in", length: "28 in", sleeve: "23.5 in", shoulder: "16 in" }, images: ["/images/casual.png"] },
      { id: "fb-3-m", sku: "FB3-M", size: "M", stock: 9, sizeMeasurements: { chest: "40 in", length: "29 in", sleeve: "24 in", shoulder: "17 in" }, images: ["/images/casual.png"] },
      { id: "fb-3-l", sku: "FB3-L", size: "L", stock: 12, sizeMeasurements: { chest: "42 in", length: "30 in", sleeve: "24.5 in", shoulder: "18 in" }, images: ["/images/casual.png"] },
      { id: "fb-3-xl", sku: "FB3-XL", size: "XL", stock: 7, sizeMeasurements: { chest: "44 in", length: "31 in", sleeve: "25 in", shoulder: "19 in" }, images: ["/images/casual.png"] },
    ],
  },
];

export default async function FeaturedProducts() {
  let displayProducts: DisplayProduct[] = [];

  try {
    const dbProducts = await db
      .select()
      .from(products)
      .where(eq(products.isActive, 1));

    const dbVariants = await db.select().from(productVariants);

    if (dbProducts.length > 0) {
      displayProducts = dbProducts.map((p) => {
        const variants = dbVariants
          .filter((v) => v.productId === p.id)
          .map((v) => ({
            id: v.id,
            sku: v.sku,
            size: v.size,
            stock: v.stock,
            sizeMeasurements: v.sizeMeasurements,
            images: v.images,
          }));

        // Extract the first image from the first variant, else use local image matching slug
        let image = "/images/casual.png";
        if (variants.length > 0 && Array.isArray(variants[0].images) && variants[0].images.length > 0) {
          image = variants[0].images[0];
        }

        return {
          id: p.id,
          name: p.name,
          color: p.color,
          slug: p.slug,
          description: p.description,
          basePrice: p.basePrice,
          fabricDetails: p.fabricDetails,
          image,
          variants,
        };
      });
    } else {
      displayProducts = FALLBACK_PRODUCTS;
    }
  } catch (error) {
    console.error("Failed to fetch products from database:", error);
    displayProducts = FALLBACK_PRODUCTS;
  }

  return (
    <section id="new-drops" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-3">
            CURATED CATALOGUE
          </span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-[0.15em] text-neutral-900 uppercase font-serif">
            New Drops
          </h2>
          <div className="mt-4 w-12 h-[1px] bg-neutral-900 mx-auto"></div>
        </div>

        {/* Client-side interactive product grid */}
        <ProductGrid products={displayProducts} />
      </div>
    </section>
  );
}
