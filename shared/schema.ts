import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for authentication)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoles = ["administrator", "moderator"] as const;

// Users table (required for authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username", { length: 50 }).unique(),
  email: varchar("email").unique(),
  password: varchar("password", { length: 255 }), // Hashed password for local auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: userRoles }).default("moderator"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  image: text("image"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  image: text("image"),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isAvailable: boolean("is_available").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// About Us content table
export const aboutUs = pgTable("about_us", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }).notNull(),
  contentEn: text("content_en").notNull(),
  contentAr: text("content_ar").notNull(),
  features: jsonb("features").default([]), // Array of feature cards with icon, titleEn, titleAr, descEn, descAr
  missionEn: text("mission_en"), // Our Mission section
  missionAr: text("mission_ar"),
  image: text("image"),
  mapUrl: text("map_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact Us information table
export const contactUs = pgTable("contact_us", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }), // Separate WhatsApp number
  email: varchar("email", { length: 255 }),
  address: text("address"),
  addressAr: text("address_ar"),
  workingHours: varchar("working_hours", { length: 255 }),
  workingHoursAr: varchar("working_hours_ar", { length: 255 }),
  socialMediaLinks: jsonb("social_media_links"), // Store as JSON: {facebook, instagram, twitter, etc.}
  googleMapsUrl: text("google_maps_url"), // Google Maps link for location
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SMTP Settings table
export const smtpSettings = pgTable("smtp_settings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  host: varchar("host", { length: 255 }).notNull(),
  port: integer("port").notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  secure: boolean("secure").default(true), // Use SSL/TLS
  fromName: varchar("from_name", { length: 255 }).notNull(),
  fromEmail: varchar("from_email", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Footer content table
export const footerContent = pgTable("footer_content", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyNameEn: varchar("company_name_en", { length: 255 }).notNull(),
  companyNameAr: varchar("company_name_ar", { length: 255 }).notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  copyrightText: varchar("copyright_text", { length: 255 }),
  quickLinks: jsonb("quick_links"), // Store as JSON array of links
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Widget settings table (for Tawk.to and other widgets)
export const widgetSettings = pgTable("widget_settings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }).notNull(),
  settings: jsonb("settings").notNull(), // Store widget configuration as JSON
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Privacy Policy content table
export const privacyPolicy = pgTable("privacy_policy", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }).notNull(),
  contentEn: text("content_en").notNull(),
  contentAr: text("content_ar").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Terms of Service content table
export const termsOfService = pgTable("terms_of_service", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }).notNull(),
  contentEn: text("content_en").notNull(),
  contentAr: text("content_ar").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer addresses table
export const customerAddresses = pgTable("customer_addresses", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  addressEn: text("address_en").notNull(),
  addressAr: text("address_ar").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  area: varchar("area", { length: 100 }).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  deliveryAddress: text("delivery_address").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"] }).default("pending"),
  paymentMethod: varchar("payment_method", { enum: ["cash", "visa", "knet", "apple_pay"] }).notNull(),
  paymentStatus: varchar("payment_status", { enum: ["pending", "paid", "failed"] }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productPrice: decimal("product_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});



// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(customerAddresses),
  cartItems: many(cartItems),
  orders: many(orders),
}));

export const customerAddressesRelations = relations(customerAddresses, ({ one }) => ({
  user: one(users, {
    fields: [customerAddresses.userId],
    references: [users.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAboutUsSchema = createInsertSchema(aboutUs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactUsSchema = createInsertSchema(contactUs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFooterContentSchema = createInsertSchema(footerContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWidgetSettingsSchema = createInsertSchema(widgetSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrivacyPolicySchema = createInsertSchema(privacyPolicy).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTermsOfServiceSchema = createInsertSchema(termsOfService).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSmtpSettingsSchema = createInsertSchema(smtpSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerAddressSchema = createInsertSchema(customerAddresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createUserSchema = insertUserSchema.extend({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email(),
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type AboutUs = typeof aboutUs.$inferSelect;
export type ContactUs = typeof contactUs.$inferSelect;
export type FooterContent = typeof footerContent.$inferSelect;
export type WidgetSettings = typeof widgetSettings.$inferSelect;
export type PrivacyPolicy = typeof privacyPolicy.$inferSelect;
export type TermsOfService = typeof termsOfService.$inferSelect;
export type SmtpSettings = typeof smtpSettings.$inferSelect;
export type CustomerAddress = typeof customerAddresses.$inferSelect;
export type InsertCustomerAddress = z.infer<typeof insertCustomerAddressSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertAboutUs = z.infer<typeof insertAboutUsSchema>;
export type InsertContactUs = z.infer<typeof insertContactUsSchema>;
export type InsertFooterContent = z.infer<typeof insertFooterContentSchema>;
export type InsertWidgetSettings = z.infer<typeof insertWidgetSettingsSchema>;
export type InsertPrivacyPolicy = z.infer<typeof insertPrivacyPolicySchema>;
export type InsertTermsOfService = z.infer<typeof insertTermsOfServiceSchema>;
export type InsertSmtpSettings = z.infer<typeof insertSmtpSettingsSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;