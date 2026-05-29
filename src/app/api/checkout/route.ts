import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productVariants, orders, orderItems, users } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";

interface CartItem {
  variantId: string;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  city: string;
  addressLine: string;
}

interface CheckoutPayload {
  cart: CartItem[];
  shipping: ShippingAddress;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutPayload = await request.json();
    const { cart, shipping } = body;

    // --- Input Validation ---
    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    if (!shipping?.name || !shipping?.phone || !shipping?.city || !shipping?.addressLine) {
      return NextResponse.json({ error: "All shipping fields are required." }, { status: 400 });
    }

    // --- Run within a database transaction ---
    const orderId = await db.transaction(async (tx) => {

      // 1. Verify stock availability for each item
      const variantIds = cart.map((item) => item.variantId);
      const dbVariants = await tx
        .select({ id: productVariants.id, stock: productVariants.stock, sku: productVariants.sku })
        .from(productVariants)
        .where(inArray(productVariants.id, variantIds));

      // Check each cart item against live stock
      for (const cartItem of cart) {
        const dbVariant = dbVariants.find((v) => v.id === cartItem.variantId);
        if (!dbVariant) {
          throw new Error(`Variant ${cartItem.variantId} not found. Refresh and try again.`);
        }
        if (dbVariant.stock < cartItem.quantity) {
          throw new Error(
            `Insufficient stock for "${cartItem.name} (${cartItem.size})". Only ${dbVariant.stock} left, you requested ${cartItem.quantity}.`
          );
        }
      }

      // 2. Find or create user by phone number
      let userId: string | null = null;
      const existingUsers = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phoneNumber, shipping.phone));

      if (existingUsers.length > 0) {
        userId = existingUsers[0].id;
      } else {
        // Create a guest user profile
        const newUsers = await tx
          .insert(users)
          .values({
            name: shipping.name,
            phoneNumber: shipping.phone,
            passwordHash: "guest_" + Math.random().toString(36).slice(2), // placeholder hash
            role: "customer",
          })
          .returning({ id: users.id });
        userId = newUsers[0].id;
      }

      // 3. Calculate total amount
      const totalAmount = cart
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2);

      // 4. Create the order record
      const newOrders = await tx
        .insert(orders)
        .values({
          userId,
          status: "pending",
          paymentStatus: "unpaid",
          totalAmount,
          shippingAddress: {
            name: shipping.name,
            phone: shipping.phone,
            city: shipping.city,
            addressLine: shipping.addressLine,
          },
        })
        .returning({ id: orders.id });
      const newOrderId = newOrders[0].id;

      // 5. Create order line items
      await tx.insert(orderItems).values(
        cart.map((item) => ({
          orderId: newOrderId,
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtPurchase: item.price.toFixed(2),
        }))
      );

      // 6. Decrement stock for each variant
      for (const cartItem of cart) {
        await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} - ${cartItem.quantity}` })
          .where(eq(productVariants.id, cartItem.variantId));
      }

      return newOrderId;
    });

    return NextResponse.json({ success: true, orderId }, { status: 200 });

  } catch (error: any) {
    console.error("Checkout error:", error);

    // Surface stock/validation errors to the client
    if (
      error.message?.includes("Insufficient stock") ||
      error.message?.includes("not found") ||
      error.message?.includes("required")
    ) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    return NextResponse.json(
      { error: "Order failed. Please try again." },
      { status: 500 }
    );
  }
}
