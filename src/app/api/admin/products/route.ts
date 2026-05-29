import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productVariants } from '@/db/schema';
import { getAdminSession } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';

function generateSlug(name: string, color: string): string {
  const base = `${name}-${color}`.toLowerCase();
  return base
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      color,
      description,
      basePrice,
      type,
      subcategory,
      fabricDetails,
      isActive,
      variants, // array of variants
    } = body;

    // Validate inputs
    if (!name || !color || !basePrice || !type || !subcategory) {
      return NextResponse.json(
        { error: 'Missing required product fields' },
        { status: 400 }
      );
    }

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: 'At least one variant is required' },
        { status: 400 }
      );
    }

    // Generate and check slug
    let slug = generateSlug(name, color);
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      // Append a small random string if slug exists
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Transaction to insert product and variants
    const result = await db.transaction(async (tx) => {
      // Insert product
      const newProducts = await tx
        .insert(products)
        .values({
          name,
          color,
          slug,
          description: description || null,
          basePrice: basePrice.toString(),
          type,
          subcategory,
          fabricDetails: fabricDetails || null,
          isActive: isActive !== undefined ? isActive : 1,
        })
        .returning({ id: products.id });

      const productId = newProducts[0].id;

      // Insert variants
      const variantsToInsert = variants.map((v: any, index: number) => {
        if (!v.size) {
          throw new Error(`Variant at index ${index} must have a size`);
        }
        
        // Generate SKU if not provided
        const sku = v.sku || `${type.substring(0, 3)}-${name.substring(0, 3)}-${color.substring(0, 3)}-${v.size}`.toUpperCase().replace(/[^A-Z0-9-]/g, '');

        return {
          productId,
          sku,
          size: v.size,
          stock: v.stock !== undefined ? parseInt(v.stock, 10) : 0,
          sizeMeasurements: v.sizeMeasurements || {},
          images: v.images || [],
        };
      });

      await tx.insert(productVariants).values(variantsToInsert);

      return { productId, slug };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product: ' + error.message },
      { status: 500 }
    );
  }
}
