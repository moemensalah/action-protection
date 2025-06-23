#!/bin/bash

# Fix for seeder import error in existing deployment
set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"

echo "Fixing seeder import error..."

cd $PROJECT_DIR

# Create a working seeder script with direct database operations
sudo -u $APP_USER tee seed-production-fixed.js << 'SEED_EOF'
import { db } from "./server/db.js";
import { 
  users, categories, products, aboutUs, contactUs, footerContent, 
  widgetSettings, privacyPolicy, termsOfService 
} from "./shared/schema.js";
import bcrypt from "bcryptjs";

async function seedProductionData() {
  try {
    console.log("🌱 Starting production data seeding...");

    // Seed Admin User
    console.log("👤 Seeding admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      id: "admin_seed_production",
      username: "admin",
      email: "admin@latelounge.sa",
      password: hashedPassword,
      firstName: "System",
      lastName: "Administrator", 
      role: "administrator",
      isActive: true
    }).onConflictDoNothing();

    // Seed Categories
    console.log("📂 Seeding categories...");
    const categoriesData = [
      {
        nameEn: "Coffee & Espresso",
        nameAr: "القهوة والإسبريسو",
        descriptionEn: "Premium coffee blends and specialty drinks",
        descriptionAr: "خلطات قهوة فاخرة ومشروبات مميزة",
        slug: "coffee",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 1
      },
      {
        nameEn: "Hot Beverages",
        nameAr: "المشروبات الساخنة",
        descriptionEn: "Warm and comforting drinks for cozy moments",
        descriptionAr: "مشروبات دافئة ومريحة للحظات الدافئة",
        slug: "hot-drinks",
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 3
      },
      {
        nameEn: "Cold Beverages",
        nameAr: "المشروبات الباردة",
        descriptionEn: "Refreshing cold drinks to beat the heat",
        descriptionAr: "مشروبات باردة منعشة لمقاومة الحر",
        slug: "cold-drinks",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 5
      },
      {
        nameEn: "Breakfast",
        nameAr: "الإفطار",
        descriptionEn: "Fresh and healthy breakfast options",
        descriptionAr: "خيارات إفطار طازجة وصحية",
        slug: "breakfast",
        image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 2
      },
      {
        nameEn: "Main Dishes",
        nameAr: "الأطباق الرئيسية",
        descriptionEn: "Hearty meals and savory delights",
        descriptionAr: "وجبات شهية ولذائذ مالحة",
        slug: "main-dishes",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 6
      },
      {
        nameEn: "Desserts",
        nameAr: "الحلويات",
        descriptionEn: "Sweet treats and indulgent desserts",
        descriptionAr: "حلويات حلوة ولذائذ منغمسة",
        slug: "desserts",
        image: "/uploads/image-1750619962137-575065094.png",
        isActive: true,
        sortOrder: 7
      }
    ];

    await db.insert(categories).values(categoriesData).onConflictDoNothing();

    // Seed basic products
    console.log("🍽️ Seeding products...");
    const productsData = [
      {
        nameEn: "Espresso",
        nameAr: "إسبريسو",
        descriptionEn: "Rich and bold espresso shot with perfect crema",
        descriptionAr: "جرعة إسبريسو غنية وجريئة مع كريما مثالية",
        price: "15.00",
        categoryId: 1,
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 100,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 1
      },
      {
        nameEn: "Latte",
        nameAr: "لاتيه",
        descriptionEn: "Smooth espresso with steamed milk and light foam",
        descriptionAr: "إسبريسو ناعم مع حليب مبخر ورغوة خفيفة",
        price: "25.00",
        categoryId: 1,
        image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 100,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 2
      }
    ];

    await db.insert(products).values(productsData).onConflictDoNothing();

    // Seed About Us
    console.log("ℹ️ Seeding about us...");
    await db.insert(aboutUs).values({
      titleEn: "About LateLounge",
      titleAr: "حول ليت لاونج",
      contentEn: "Welcome to LateLounge, where exceptional coffee meets warm hospitality.",
      contentAr: "مرحباً بكم في ليت لاونج، حيث تلتقي القهوة الاستثنائية بالضيافة الدافئة.",
      isActive: true
    }).onConflictDoNothing();

    // Seed Contact Us
    console.log("📞 Seeding contact us...");
    await db.insert(contactUs).values({
      phone: "+966 11 555 1234",
      whatsapp: "966555555555",
      email: "contact@latelounge.sa",
      address: "456 Coffee Street, Riyadh",
      addressAr: "456 شارع القهوة، الرياض",
      workingHours: "Daily: 6AM-12AM",
      workingHoursAr: "يومياً: 6ص-12م",
      socialMediaLinks: JSON.stringify({
        twitter: "https://twitter.com/latelounge_sa",
        facebook: "https://facebook.com/latelounge",
        instagram: "https://instagram.com/latelounge_sa"
      }),
      isActive: true
    }).onConflictDoNothing();

    console.log("✅ Production data seeded successfully!");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

seedProductionData().then(() => {
  console.log("🎉 Database seeding completed!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Fatal seeding error:", error);
  process.exit(1);
});
SEED_EOF

# Run the fixed seeder
echo "Running fixed seeder..."
sudo -u $APP_USER node --import tsx/esm seed-production-fixed.js

echo "✅ Seeder import issue fixed and data seeded!"