#!/bin/bash

echo "=== CREATING ADMIN USER SEEDER ==="

cd /home/appuser/latelounge

# Update database schema first
sudo -u appuser npm run db:push

# Create comprehensive seeding script with default admin
sudo -u appuser tee seed-with-admin.js << 'EOF'
import { storage } from "./dist/storage.js";

async function seedWithAdmin() {
  console.log("🌱 Starting complete database seeding with admin user...");

  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    if (existingAdmin) {
      console.log("✅ Admin user already exists");
    } else {
      // Create default admin user
      console.log("👤 Creating default admin user...");
      const defaultAdmin = await storage.createLocalUser({
        username: "admin",
        email: "admin@latelounge.sa",
        password: "admin123456", // Default password - CHANGE IN PRODUCTION
        firstName: "System",
        lastName: "Administrator",
        role: "administrator",
        isActive: true
      });
      console.log(`✅ Created admin user: ${defaultAdmin.username}`);
      console.log(`📧 Email: ${defaultAdmin.email}`);
      console.log("🔑 Default password: admin123456 (PLEASE CHANGE THIS!)");
    }

    // Check if data already exists
    const existingCategories = await storage.getCategories();
    if (existingCategories.length > 0) {
      console.log("✅ Sample data already exists");
      return;
    }

    // Seed Categories
    console.log("📂 Seeding categories...");
    const categoryData = [
      {
        nameEn: "Coffee & Espresso",
        nameAr: "القهوة والإسبريسو",
        descriptionEn: "Premium coffee blends and specialty drinks",
        descriptionAr: "خلطات قهوة فاخرة ومشروبات مميزة",
        slug: "coffee",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true
      },
      {
        nameEn: "Hot Beverages",
        nameAr: "المشروبات الساخنة",
        descriptionEn: "Warm and comforting drinks for cozy moments",
        descriptionAr: "مشروبات دافئة ومريحة للحظات الدافئة",
        slug: "hot-drinks",
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true
      },
      {
        nameEn: "Cold Beverages",
        nameAr: "المشروبات الباردة",
        descriptionEn: "Refreshing cold drinks to beat the heat",
        descriptionAr: "مشروبات باردة منعشة لمقاومة الحر",
        slug: "cold-drinks",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true
      },
      {
        nameEn: "Food",
        nameAr: "الطعام",
        descriptionEn: "Delicious food options and snacks",
        descriptionAr: "خيارات طعام لذيذة ووجبات خفيفة",
        slug: "food",
        image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true
      }
    ];

    const categories = [];
    for (const category of categoryData) {
      const created = await storage.createCategory(category);
      categories.push(created);
      console.log(`✅ Created category: ${category.nameEn}`);
    }

    // Seed Products
    console.log("🍽️ Seeding products...");
    const productData = [
      {
        nameEn: "Espresso",
        nameAr: "إسبريسو",
        descriptionEn: "Rich and bold espresso shot with perfect crema",
        descriptionAr: "جرعة إسبريسو غنية وجريئة مع كريما مثالية",
        price: "15.00",
        categoryId: categories[0].id,
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true,
        isFeatured: true,
        isAvailable: true
      },
      {
        nameEn: "Cappuccino",
        nameAr: "كابتشينو",
        descriptionEn: "Classic Italian coffee with steamed milk and foam",
        descriptionAr: "قهوة إيطالية كلاسيكية مع حليب مبخر ورغوة",
        price: "22.00",
        categoryId: categories[0].id,
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },
      {
        nameEn: "Latte",
        nameAr: "لاتيه",
        descriptionEn: "Smooth espresso with steamed milk and light foam",
        descriptionAr: "إسبريسو ناعم مع حليب مبخر ورغوة خفيفة",
        price: "25.00",
        categoryId: categories[0].id,
        image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true,
        isFeatured: true,
        isAvailable: true
      },
      {
        nameEn: "Green Tea",
        nameAr: "شاي أخضر",
        descriptionEn: "Premium organic green tea with antioxidants",
        descriptionAr: "شاي أخضر عضوي فاخر مع مضادات الأكسدة",
        price: "18.00",
        categoryId: categories[1].id,
        image: "https://images.unsplash.com/photo-1556881286-fc6915169721?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },
      {
        nameEn: "Hot Chocolate",
        nameAr: "شوكولاتة ساخنة",
        descriptionEn: "Rich hot chocolate with whipped cream",
        descriptionAr: "شوكولاتة ساخنة غنية مع كريمة مخفوقة",
        price: "25.00",
        categoryId: categories[1].id,
        image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },
      {
        nameEn: "Iced Americano",
        nameAr: "أمريكانو مثلج",
        descriptionEn: "Refreshing iced coffee with bold espresso flavor",
        descriptionAr: "قهوة مثلجة منعشة بنكهة إسبريسو جريئة",
        price: "20.00",
        categoryId: categories[2].id,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true,
        isFeatured: true,
        isAvailable: true
      },
      {
        nameEn: "Iced Latte",
        nameAr: "لاتيه مثلج",
        descriptionEn: "Cold espresso with chilled milk over ice",
        descriptionAr: "إسبريسو بارد مع حليب مبرد على الثلج",
        price: "25.00",
        categoryId: categories[2].id,
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },
      {
        nameEn: "Club Sandwich",
        nameAr: "ساندويتش كلوب",
        descriptionEn: "Classic club sandwich with chicken, bacon, and fresh vegetables",
        descriptionAr: "ساندويتش كلوب كلاسيكي مع دجاج ولحم مقدد وخضروات طازجة",
        price: "35.00",
        categoryId: categories[3].id,
        image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true,
        isFeatured: true,
        isAvailable: true
      }
    ];

    for (const product of productData) {
      await storage.createProduct(product);
      console.log(`✅ Created product: ${product.nameEn}`);
    }

    // Seed Contact Us
    console.log("📞 Seeding Contact Us...");
    await storage.createOrUpdateContactUs({
      phone: "+966 11 555 123413335",
      whatsapp: "+966505551234",
      email: "info@latelounge.sa",
      address: "123 King Fahd Road, Riyadh, Saudi Arabia",
      addressAr: "123 طريق الملك فهد، الرياض، المملكة العربية السعودية",
      workingHours: "Sunday - Thursday: 7:00 AM - 11:00 PM",
      workingHoursAr: "الأحد - الخميس: 7:00 ص - 11:00 م",
      socialMediaLinks: {
        instagram: "https://instagram.com/latelounge",
        twitter: "https://twitter.com/latelounge",
        facebook: "https://facebook.com/latelounge",
        snapchat: "https://snapchat.com/add/latelounge"
      },
      isActive: true
    });

    // Seed Footer Content
    console.log("🦶 Seeding Footer content...");
    await storage.createOrUpdateFooterContent({
      companyNameEn: "LateLounge*",
      companyNameAr: "ليت لاونج*",
      descriptionEn: "Premium coffee experience with authentic flavors and warm hospitality",
      descriptionAr: "تجربة قهوة فاخرة مع نكهات أصيلة وضيافة دافئة",
      copyrightText: "© 2024 LateLounge. All rights reserved.",
      quickLinks: [
        { nameEn: "About Us", nameAr: "من نحن", url: "/about" },
        { nameEn: "Menu", nameAr: "القائمة", url: "/menu" },
        { nameEn: "Contact", nameAr: "اتصل بنا", url: "/contact" },
        { nameEn: "Privacy Policy", nameAr: "سياسة الخصوصية", url: "/privacy" }
      ],
      isActive: true
    });

    // Seed About Us
    console.log("ℹ️ Seeding About Us...");
    await storage.createOrUpdateAboutUs({
      titleEn: "About LateLounge",
      titleAr: "حول ليت لاونج",
      contentEn: "Welcome to LateLounge, where exceptional coffee meets warm hospitality. We are dedicated to creating a unique coffee experience that brings people together.",
      contentAr: "مرحباً بكم في ليت لاونج، حيث تلتقي القهوة الاستثنائية مع الضيافة الدافئة. نحن ملتزمون بخلق تجربة قهوة فريدة تجمع الناس.",
      image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      isActive: true
    });

    // Seed Widget Settings
    console.log("🔧 Seeding Widget Settings...");
    await storage.createOrUpdateWidget({
      name: "tawk_chat",
      titleEn: "Live Chat Support",
      titleAr: "دعم الدردشة المباشرة",
      descriptionEn: "Get instant help from our support team",
      descriptionAr: "احصل على مساعدة فورية من فريق الدعم",
      settings: {
        enabled: true,
        tawkId: "default-tawk-id",
        position: "bottom-right"
      },
      isActive: true
    });

    console.log("🎉 Database seeding completed successfully!");
    console.log("");
    console.log("=== LOGIN CREDENTIALS ===");
    console.log("Username: admin");
    console.log("Password: admin123456");
    console.log("Email: admin@latelounge.sa");
    console.log("IMPORTANT: Change the default password after first login!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedWithAdmin().then(() => {
  console.log("✅ Seeding process finished");
  process.exit(0);
});
EOF

# Run the seeding script
echo "Running database seeding with admin user..."
sudo -u appuser node seed-with-admin.js

# Test APIs
echo "Testing APIs..."
curl -s http://localhost:3000/api/categories | head -100
curl -s http://localhost:3000/api/products | head -100
curl -s http://localhost:3000/api/contact | head -100

# Restart PM2
sudo -u appuser pm2 restart latelounge

echo "=== ADMIN SEEDING COMPLETE ==="
echo ""
echo "🎯 Default Admin Credentials:"
echo "Username: admin"
echo "Password: admin123456"
echo "Email: admin@latelounge.sa"
echo ""
echo "⚠️  IMPORTANT: Change the default password after first login!"