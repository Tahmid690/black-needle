import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productVariants } from '@/db/schema';
import { getAdminSession } from '@/lib/admin-auth';
import { eq, inArray, notInArray, and } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId } = await params;
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

    // Validate product fields
    if (!name || !color || !basePrice || !type || !subcategory) {
      return NextResponse.json(
        { error: 'Missing required product fields' },
        { status: 400 }
      );
    }

    // Sync product and variants in transaction
    await db.transaction(async (tx) => {
      // 1. Update product
      await tx
        .update(products)
        .set({
          name,
          color,
          description: description || null,
          basePrice: basePrice.toString(),
          type,
          subcategory,
          fabricDetails: fabricDetails || null,
          isActive: isActive !== undefined ? isActive : 1,
        })
        .where(eq(products.id, productId));

      if (variants && Array.isArray(variants)) {
        // Sync variants
        const incomingVariantIds = variants
          .filter((v: any) => v.id)
          .map((v: any) => v.id);

        // Delete variants that are not in incoming list
        if (incomingVariantIds.length > 0) {
          await tx
            .delete(productVariants)
            .where(
              and(
                eq(productVariants.productId, productId),
                notInArray(productVariants.id, incomingVariantIds)
              )
            );
        } else {
          // If no variants have IDs, delete all current variants
          await tx
            .delete(productVariants)
            .where(eq(productVariants.productId, productId));
        }

        // Insert new / update existing variants
        for (const v of variants) {
          const sku = v.sku || `${type.substring(0, 3)}-${name.substring(0, 3)}-${color.substring(0, 3)}-${v.size}`.toUpperCase().replace(/[^A-Z0-9-]/g, '');
          const variantData = {
            sku,
            size: v.size,
            stock: v.stock !== undefined ? parseInt(v.stock, 10) : 0,
            sizeMeasurements: v.sizeMeasurements || {},
            images: v.images || [],
          };

          if (v.id) {
            // Update existing
            await tx
              .update(productVariants)
              .set(variantData)
              .where(eq(productVariants.id, v.id));
          } else {
            // Insert new
            await tx.insert(productVariants).values({
              productId,
              ...variantData,
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId } = await params;

    const deleted = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product: ' + error.message },
      { status: 500 }
    );
  }
}
