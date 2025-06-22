import {
  users,
  categories,
  products,
  aboutUs,
  contactUs,
  footerContent,
  widgetSettings,
  type User,
  type UpsertUser,
  type Category,
  type Product,
  type AboutUs,
  type ContactUs,
  type FooterContent,
  type WidgetSettings,
  type InsertCategory,
  type InsertProduct,
  type InsertAboutUs,
  type InsertContactUs,
  type InsertFooterContent,
  type InsertWidgetSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, lt, gt, desc, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  reorderCategory(id: number, direction: 'up' | 'down'): Promise<void>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductsByCategorySlug(slug: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  
  // About Us
  getAboutUs(): Promise<AboutUs | undefined>;
  createOrUpdateAboutUs(aboutUsData: InsertAboutUs): Promise<AboutUs>;
  
  // Contact Us
  getContactUs(): Promise<ContactUs | undefined>;
  createOrUpdateContactUs(contactData: InsertContactUs): Promise<ContactUs>;
  
  // Footer Content
  getFooterContent(): Promise<FooterContent | undefined>;
  createOrUpdateFooterContent(footerData: InsertFooterContent): Promise<FooterContent>;
  
  // Widget Settings
  getWidgetSettings(): Promise<WidgetSettings[]>;
  getWidgetByName(name: string): Promise<WidgetSettings | undefined>;
  createOrUpdateWidget(widgetData: InsertWidgetSettings): Promise<WidgetSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    // First delete all products in this category
    await db.delete(products).where(eq(products.categoryId, id));
    // Then delete the category
    await db.delete(categories).where(eq(categories.id, id));
  }

  async reorderCategory(id: number, direction: 'up' | 'down'): Promise<void> {
    // Get current category
    const [currentCategory] = await db.select().from(categories).where(eq(categories.id, id));
    if (!currentCategory) return;

    const currentOrder = currentCategory.sortOrder || 0;

    if (direction === 'up') {
      // Find the category with the next lower sort order
      const [targetCategory] = await db
        .select()
        .from(categories)
        .where(lt(categories.sortOrder, currentOrder))
        .orderBy(desc(categories.sortOrder))
        .limit(1);

      if (targetCategory) {
        // Swap the sort orders
        await db.update(categories)
          .set({ sortOrder: targetCategory.sortOrder })
          .where(eq(categories.id, id));
        
        await db.update(categories)
          .set({ sortOrder: currentOrder })
          .where(eq(categories.id, targetCategory.id));
      }
    } else {
      // Find the category with the next higher sort order
      const [targetCategory] = await db
        .select()
        .from(categories)
        .where(gt(categories.sortOrder, currentOrder))
        .orderBy(asc(categories.sortOrder))
        .limit(1);

      if (targetCategory) {
        // Swap the sort orders
        await db.update(categories)
          .set({ sortOrder: targetCategory.sortOrder })
          .where(eq(categories.id, id));
        
        await db.update(categories)
          .set({ sortOrder: currentOrder })
          .where(eq(categories.id, targetCategory.id));
      }
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId));
  }

  async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    const category = await this.getCategoryBySlug(slug);
    if (!category) return [];
    return await this.getProductsByCategory(category.id);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  // About Us
  async getAboutUs(): Promise<AboutUs | undefined> {
    const [aboutUsData] = await db.select().from(aboutUs).where(eq(aboutUs.isActive, true));
    return aboutUsData;
  }

  async createOrUpdateAboutUs(aboutUsData: InsertAboutUs): Promise<AboutUs> {
    const existing = await this.getAboutUs();
    
    if (existing) {
      const [updated] = await db
        .update(aboutUs)
        .set({ ...aboutUsData, updatedAt: new Date() })
        .where(eq(aboutUs.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(aboutUs)
        .values(aboutUsData)
        .returning();
      return created;
    }
  }

  // Contact Us
  async getContactUs(): Promise<ContactUs | undefined> {
    const [contactData] = await db.select().from(contactUs).where(eq(contactUs.isActive, true));
    return contactData;
  }

  async createOrUpdateContactUs(contactData: InsertContactUs): Promise<ContactUs> {
    const existing = await this.getContactUs();
    
    if (existing) {
      const [updated] = await db
        .update(contactUs)
        .set({ ...contactData, updatedAt: new Date() })
        .where(eq(contactUs.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(contactUs)
        .values(contactData)
        .returning();
      return created;
    }
  }

  // Footer Content
  async getFooterContent(): Promise<FooterContent | undefined> {
    const [footerData] = await db.select().from(footerContent).where(eq(footerContent.isActive, true));
    return footerData;
  }

  async createOrUpdateFooterContent(footerData: InsertFooterContent): Promise<FooterContent> {
    const existing = await this.getFooterContent();
    
    if (existing) {
      const [updated] = await db
        .update(footerContent)
        .set({ ...footerData, updatedAt: new Date() })
        .where(eq(footerContent.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(footerContent)
        .values(footerData)
        .returning();
      return created;
    }
  }

  // Widget Settings
  async getWidgetSettings(): Promise<WidgetSettings[]> {
    return await db.select().from(widgetSettings).where(eq(widgetSettings.isActive, true));
  }

  async getWidgetByName(name: string): Promise<WidgetSettings | undefined> {
    const [widget] = await db
      .select()
      .from(widgetSettings)
      .where(eq(widgetSettings.widgetName, name));
    return widget;
  }

  async createOrUpdateWidget(widgetData: InsertWidgetSettings): Promise<WidgetSettings> {
    const existing = await this.getWidgetByName(widgetData.widgetName);
    
    if (existing) {
      const [updated] = await db
        .update(widgetSettings)
        .set({ ...widgetData, updatedAt: new Date() })
        .where(eq(widgetSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(widgetSettings)
        .values(widgetData)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();