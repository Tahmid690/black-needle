import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from './index';
import { products, productVariants, orders, orderItems } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // ── CLEANUP ────────────────────────────────────────────────────────────────
  console.log('🧹 Cleaning up old orders, variants, and products...');
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(productVariants);
  await db.delete(products);

  // ── PRODUCTS ────────────────────────────────────────────────────────────────
  const insertedProducts = await db
    .insert(products)
    .values([
      {
        name: 'Classic Oxford Shirt',
        color: 'Midnight Black',
        slug: 'classic-oxford-shirt-midnight-black',
        description:
          'A timeless Oxford shirt crafted from 100% premium cotton. Structured collar, chest pocket, and a relaxed fit that works from office to weekend.',
        basePrice: '4500.00',
        type: 'shirts',
        subcategory: 'Oxford',
        fabricDetails: '100% Premium Egyptian Cotton, 120 GSM',
        isActive: 1,
      },
      {
        name: 'Classic Oxford Shirt',
        color: 'Arctic White',
        slug: 'classic-oxford-shirt-arctic-white',
        description:
          'A timeless Oxford shirt crafted from 100% premium cotton. Structured collar, chest pocket, and a relaxed fit that works from office to weekend.',
        basePrice: '4500.00',
        type: 'shirts',
        subcategory: 'Oxford',
        fabricDetails: '100% Premium Egyptian Cotton, 120 GSM',
        isActive: 1,
      },
      {
        name: 'Premium Linen Button-Down',
        color: 'Sahara Sand',
        slug: 'premium-linen-button-down-sahara-sand',
        description:
          'Breathable linen weave with a slightly relaxed silhouette. Perfect for warm days — the fabric softens beautifully with every wash.',
        basePrice: '5200.00',
        type: 'shirts',
        subcategory: 'Linen',
        fabricDetails: '55% Linen, 45% Cotton, 130 GSM',
        isActive: 1,
      },
    ])
    .returning({ id: products.id, slug: products.slug });

  console.log(`✅ Inserted ${insertedProducts.length} products`);

  // ── VARIANTS ─────────────────────────────────────────────────────────────────
  // Map slug → id for variant linking
  const productMap = Object.fromEntries(
    insertedProducts.map((p) => [p.slug, p.id])
  );

  const sizes = [
    { size: 'S', measurements: { chest: '38 in', length: '28 in', sleeve: '23.5 in', shoulder: '16 in' } },
    { size: 'M', measurements: { chest: '40 in', length: '29 in', sleeve: '24 in',   shoulder: '17 in' } },
    { size: 'L', measurements: { chest: '42 in', length: '30 in', sleeve: '24.5 in', shoulder: '18 in' } },
    { size: 'XL', measurements: { chest: '44 in', length: '31 in', sleeve: '25 in',  shoulder: '19 in' } },
  ];

  const variantData = [];

  for (const product of insertedProducts) {
    const skuBase = product.slug
      .toUpperCase()
      .replace(/-/g, '_');

    // Select the best matching local image asset for the product
    let localImage = '/images/casual.png';
    if (product.slug.includes('midnight-black')) {
      localImage = '/images/hero.png';
    } else if (product.slug.includes('arctic-white')) {
      localImage = '/images/formal.png';
    }

    for (const { size, measurements } of sizes) {
      variantData.push({
        productId: product.id,
        sku: `${skuBase}_${size}`,
        size,
        stock: Math.floor(Math.random() * 20) + 5, // 5–24 units
        sizeMeasurements: measurements,
        images: [localImage],
      });
    }
  }

  await db.insert(productVariants).values(variantData);

  console.log(`✅ Inserted ${variantData.length} product variants`);
  console.log('🎉 Seeding complete!');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
