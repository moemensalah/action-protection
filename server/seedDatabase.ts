import { storage } from "./storage";

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
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
        nameEn: "Breakfast",
        nameAr: "الإفطار",
        descriptionEn: "Fresh and healthy breakfast options",
        descriptionAr: "خيارات إفطار طازجة وصحية",
        slug: "breakfast",
        image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true
      },
      {
        nameEn: "Main Dishes",
        nameAr: "الأطباق الرئيسية",
        descriptionEn: "Hearty meals and savory delights",
        descriptionAr: "وجبات شهية ولذائذ مالحة",
        slug: "main-dishes",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true
      },
      {
        nameEn: "Desserts",
        nameAr: "الحلويات",
        descriptionEn: "Sweet treats and indulgent desserts",
        descriptionAr: "حلويات حلوة ولذائذ منغمسة",
        slug: "desserts",
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
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
      // Coffee & Espresso (category 1)
      {
        nameEn: "Espresso",
        nameAr: "إسبريسو",
        descriptionEn: "Rich and bold espresso shot with perfect crema",
        descriptionAr: "جرعة إسبريسو غنية وجريئة مع كريما مثالية",
        price: "15.00",
        categoryId: categories[0].id,
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 100,
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
        stock: 100,
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
        stock: 100,
        isActive: true,
        isFeatured: true,
        isAvailable: true
      },
      {
        nameEn: "Turkish Coffee",
        nameAr: "قهوة تركية",
        descriptionEn: "Traditional Turkish coffee served with authentic preparation",
        descriptionAr: "قهوة تركية تقليدية تُقدم بالتحضير الأصيل",
        price: "20.00",
        categoryId: categories[0].id,
        image: "https://images.unsplash.com/photo-1497636577773-f1231844b336?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 50,
        isActive: true,
        isFeatured: true,
        isAvailable: true
      },
      {
        nameEn: "Arabic Coffee",
        nameAr: "قهوة عربية",
        descriptionEn: "Traditional Arabic coffee with cardamom and dates",
        descriptionAr: "قهوة عربية تقليدية مع الهيل والتمر",
        price: "18.00",
        categoryId: categories[0].id,
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 50,
        isActive: true,
        isFeatured: true,
        isAvailable: true
      },

      // Hot Beverages (category 2)
      {
        nameEn: "Green Tea",
        nameAr: "شاي أخضر",
        descriptionEn: "Premium organic green tea with antioxidants",
        descriptionAr: "شاي أخضر عضوي فاخر مع مضادات الأكسدة",
        price: "18.00",
        categoryId: categories[1].id,
        image: "https://images.unsplash.com/photo-1556881286-fc6915169721?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 75,
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },
      {
        nameEn: "Earl Grey",
        nameAr: "إيرل جراي",
        descriptionEn: "Classic black tea with bergamot oil",
        descriptionAr: "شاي أسود كلاسيكي مع زيت البرغموت",
        price: "20.00",
        categoryId: categories[1].id,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 60,
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },
      {
        nameEn: "Moroccan Mint Tea",
        nameAr: "شاي النعناع المغربي",
        descriptionEn: "Refreshing mint tea with traditional Moroccan preparation",
        descriptionAr: "شاي النعناع المنعش بالتحضير المغربي التقليدي",
        price: "22.00",
        categoryId: categories[1].id,
        image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 40,
        isActive: true,
        isFeatured: true,
        isAvailable: true
      },
      {
        nameEn: "Hot Chocolate",
        nameAr: "شوكولاتة ساخنة",
        descriptionEn: "Rich hot chocolate with whipped cream and marshmallows",
        descriptionAr: "شوكولاتة ساخنة غنية مع كريمة مخفوقة ومارشميلو",
        price: "25.00",
        categoryId: categories[1].id,
        image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 80,
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },

      // Cold Beverages (category 3)
      {
        nameEn: "Iced Americano",
        nameAr: "أمريكانو مثلج",
        descriptionEn: "Refreshing iced coffee with bold espresso flavor",
        descriptionAr: "قهوة مثلجة منعشة بنكهة إسبريسو جريئة",
        price: "20.00",
        categoryId: categories[2].id,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 90,
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
        stock: 85,
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },
      {
        nameEn: "Fresh Orange Juice",
        nameAr: "عصير برتقال طازج",
        descriptionEn: "Freshly squeezed orange juice with natural pulp",
        descriptionAr: "عصير برتقال طازج مع اللب الطبيعي",
        price: "16.00",
        categoryId: categories[2].id,
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 50,
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },
      {
        nameEn: "Iced Tea",
        nameAr: "شاي مثلج",
        descriptionEn: "Refreshing iced tea with lemon and mint",
        descriptionAr: "شاي مثلج منعش مع الليمون والنعناع",
        price: "15.00",
        categoryId: categories[2].id,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 70,
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },

      // Breakfast (category 4)
      {
        nameEn: "Avocado Toast",
        nameAr: "توست الأفوكادو",
        descriptionEn: "Fresh avocado on toasted artisan bread with herbs",
        descriptionAr: "أفوكادو طازج على خبز حرفي محمص مع الأعشاب",
        price: "28.00",
        categoryId: categories[3].id,
        image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 30,
        isActive: true,
        isFeatured: true,
        isAvailable: true
      },
      {
        nameEn: "Croissant",
        nameAr: "كرواسون",
        descriptionEn: "Buttery, flaky French pastry baked fresh daily",
        descriptionAr: "معجنات فرنسية مقرمشة بالزبدة مخبوزة طازجة يومياً",
        price: "15.00",
        categoryId: categories[3].id,
        image: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 25,
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },

      // Main Dishes (category 5)
      {
        nameEn: "Grilled Chicken Sandwich",
        nameAr: "ساندويتش دجاج مشوي",
        descriptionEn: "Tender grilled chicken with fresh vegetables",
        descriptionAr: "دجاج مشوي طري مع خضروات طازجة",
        price: "45.00",
        categoryId: categories[4].id,
        image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 20,
        isActive: true,
        isFeatured: true,
        isAvailable: true
      },
      {
        nameEn: "Caesar Salad",
        nameAr: "سلطة قيصر",
        descriptionEn: "Crisp romaine lettuce with parmesan and croutons",
        descriptionAr: "خس روماني مقرمش مع البارميزان والخبز المحمص",
        price: "35.00",
        categoryId: categories[4].id,
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 25,
        isActive: true,
        isFeatured: false,
        isAvailable: true
      },

      // Desserts (category 6)
      {
        nameEn: "Chocolate Cake",
        nameAr: "كعكة الشوكولاتة",
        descriptionEn: "Rich dark chocolate cake with smooth ganache",
        descriptionAr: "كعكة شوكولاتة داكنة غنية مع جاناش ناعم",
        price: "25.00",
        categoryId: categories[5].id,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 15,
        isActive: true,
        isFeatured: true,
        isAvailable: true
      },
      {
        nameEn: "Tiramisu",
        nameAr: "تيراميسو",
        descriptionEn: "Classic Italian dessert with coffee and mascarpone",
        descriptionAr: "حلوى إيطالية كلاسيكية مع القهوة والماسكاربوني",
        price: "30.00",
        categoryId: categories[5].id,
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 12,
        isActive: true,
        isFeatured: false,
        isAvailable: true
      }
    ];

    for (const product of productData) {
      await storage.createProduct(product);
      console.log(`✅ Created product: ${product.nameEn}`);
    }

    // Seed About Us
    console.log("ℹ️ Seeding About Us content...");
    await storage.createOrUpdateAboutUs({
      titleEn: "About LateLounge",
      titleAr: "حول ليت لاونج",
      contentEn: "Welcome to LateLounge, where premium coffee meets exceptional hospitality. Our journey began with a simple mission: to create a space where coffee lovers can experience the finest blends and authentic flavors in a warm, inviting atmosphere. We source our beans from the world's best coffee regions and prepare each cup with passion and precision.",
      contentAr: "مرحباً بكم في ليت لاونج، حيث تلتقي القهوة المميزة بالضيافة الاستثنائية. بدأت رحلتنا برسالة بسيطة: إنشاء مساحة يمكن لمحبي القهوة فيها تجربة أفضل الخلطات والنكهات الأصيلة في جو دافئ ومرحب. نحن نحصل على حبوبنا من أفضل مناطق القهوة في العالم ونحضر كل كوب بشغف ودقة.",
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      isActive: true
    });

    // Seed Contact Us
    console.log("📞 Seeding Contact Us information...");
    await storage.createOrUpdateContactUs({
      phone: "+966 11 123 4567",
      email: "info@latelounge.sa",
      address: "123 King Fahd Road, Riyadh, Saudi Arabia",
      addressAr: "123 طريق الملك فهد، الرياض، المملكة العربية السعودية",
      workingHours: "Sunday - Thursday: 7:00 AM - 11:00 PM, Friday - Saturday: 2:00 PM - 12:00 AM",
      workingHoursAr: "الأحد - الخميس: 7:00 ص - 11:00 م، الجمعة - السبت: 2:00 م - 12:00 ص",
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
      companyNameEn: "LateLounge",
      companyNameAr: "ليت لاونج",
      descriptionEn: "Premium coffee experience with authentic flavors and warm hospitality",
      descriptionAr: "تجربة قهوة مميزة مع نكهات أصيلة وضيافة دافئة",
      copyrightText: "© 2024 LateLounge. All rights reserved.",
      quickLinks: [
        { nameEn: "Menu", nameAr: "القائمة", url: "/menu" },
        { nameEn: "About", nameAr: "حولنا", url: "/about" },
        { nameEn: "Contact", nameAr: "اتصل بنا", url: "/contact" },
        { nameEn: "Privacy Policy", nameAr: "سياسة الخصوصية", url: "/privacy" }
      ],
      isActive: true
    });

    // Seed Widget Settings
    console.log("🔧 Seeding Widget settings...");
    await storage.createOrUpdateWidget({
      widgetName: "tawk_to",
      widgetKey: "6856e499f4cfc5190e97ea98/1iu9mpub8",
      isActive: true
    });

    console.log("🎉 Database seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}