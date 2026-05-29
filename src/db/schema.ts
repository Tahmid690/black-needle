import { pgTable, text, timestamp, integer, numeric, uuid, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['customer', 'admin']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'paid', 'refunded']);
export const productTypeEnum = pgEnum('product_type', ['shirts', 'pants', 'outerwear', 'footwear', 'accessories']);

// ==========================================
// 1. USER MANAGEMENT (PHONE-BASED)
// ==========================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  phoneNumber: text('phone_number').notNull().unique(), // Primary login identifier
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('customer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 2. PRODUCTS (COLOR-SPECIFIC ENTRIES)
// ==========================================
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),         // e.g., "Premium Linen Button-Down"
  color: text('color').notNull(),       // e.g., "Sky Blue" (Moved here so distinct colors act as distinct products)
  slug: text('slug').notNull().unique(), // e.g., "premium-linen-button-down-sky-blue"
  description: text('description'),
  basePrice: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
  
  type: productTypeEnum('type').notNull(), 
  subcategory: text('subcategory').notNull(), 
  
  fabricDetails: text('fabric_details'), 
  isActive: integer('is_active').default(1).notNull(), // 1 = Active Storefront, 0 = Draft/Hidden
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 3. PRODUCT VARIANTS (SIZE, MEASUREMENTS & LIVE INVENTORY)
// ==========================================
export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  sku: text('sku').notNull().unique(),  // e.g., "SHRT-LIN-BLU-L"
  size: text('size').notNull(),         // e.g., "L", "XL", "34"
  
  // LIVE INVENTORY MANAGEMENT
  stock: integer('stock').default(0).notNull(), // Admin manages this value to reflect physical warehouse levels
  
  // DYNAMIC MEASUREMENTS FOR APPAREL
  // Stores custom specs: {"chest": "44 in", "length": "30 in", "sleeve": "25.5 in"}
  sizeMeasurements: jsonb('size_measurements').default('{}').notNull(), 
  
  // Array of image strings showcasing this exact color/style variant
  images: jsonb('images').notNull(),    
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index('product_variants_product_id_idx').on(table.productId),
}));

// ==========================================
// 4. LOGISTICS & TRANSACTIONS
// ==========================================
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id), 
  status: orderStatusEnum('status').default('pending').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('unpaid').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb('shipping_address').notNull(), // { name, phone, city, addressLine }
  trackingNumber: text('tracking_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('orders_user_id_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
}));

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id).notNull(),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: numeric('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
}, (table) => ({
  orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
  variantIdIdx: index('order_items_variant_id_idx').on(table.variantId),
}));
