import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productVariants } from '@/db/schema';
import { getAdminSession } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    // 1. Authenticate
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { variantId } = await params;
    const body = await request.json();
    const { stock } = body;

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(productVariants)
      .set({ stock: parsedStock })
      .where(eq(productVariants.id, variantId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, variant: updated[0] });
  } catch (error: any) {
    console.error('Update inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to update stock: ' + error.message },
      { status: 500 }
    );
  }
}
