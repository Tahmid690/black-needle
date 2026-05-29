import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { getAdminSession } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';

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

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body; // should be 0 or 1

    if (isActive !== 0 && isActive !== 1) {
      return NextResponse.json(
        { error: 'isActive must be 0 (draft) or 1 (active)' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(products)
      .set({ isActive })
      .where(eq(products.id, id))
      .returning({ id: products.id, isActive: products.isActive });

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated[0] });
  } catch (error: any) {
    console.error('Toggle active error:', error);
    return NextResponse.json(
      { error: 'Failed to update visibility: ' + error.message },
      { status: 500 }
    );
  }
}
