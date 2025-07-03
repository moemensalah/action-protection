import { db } from "./db";
import { 
  users, categories, products, aboutUs, contactUs, footerContent, 
  widgetSettings, privacyPolicy, termsOfService, smtpSettings, experienceSection 
} from "@shared/schema";
import bcrypt from "bcryptjs";

export async function seedProductionData() {
  try {
    console.log("🌱 Starting production data seeding...");

    // Seed Categories
    console.log("📂 Seeding categories...");
    const categoriesData = [
      {
        id: 1,
        nameEn: "Thermal Insulator",
        nameAr: "عازل حراري",
        descriptionEn: "Advanced thermal insulation solutions for vehicle protection",
        descriptionAr: "حلول عزل حراري متقدمة لحماية المركبات",
        slug: "thermal-insulator",
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 1
      },
      {
        id: 2,
        nameEn: "Thermal Insulation Protection",
        nameAr: "حماية العزل الحراري",
        descriptionEn: "Complete thermal protection systems for automotive applications",
        descriptionAr: "أنظمة حماية حرارية متكاملة للتطبيقات السيارات",
        slug: "thermal-protection",
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 2
      },
      {
        id: 3,
        nameEn: "Protection",
        nameAr: "الحماية",
        descriptionEn: "Comprehensive vehicle protection services and products",
        descriptionAr: "خدمات ومنتجات حماية شاملة للمركبات",
        slug: "protection",
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 3
      },
      {
        id: 4,
        nameEn: "Polish",
        nameAr: "التلميع",
        descriptionEn: "Professional car polishing and detailing services",
        descriptionAr: "خدمات تلميع وتفصيل السيارات الاحترافية",
        slug: "polish",
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 4
      },
      {
        id: 5,
        nameEn: "Painting and Vacuuming",
        nameAr: "الطلاء والتنظيف",
        descriptionEn: "Professional automotive painting and interior cleaning services",
        descriptionAr: "خدمات طلاء السيارات والتنظيف الداخلي الاحترافية",
        slug: "painting-vacuuming",
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 5
      },
      {
        id: 4,
        nameEn: "Breakfast",
        nameAr: "الإفطار",
        descriptionEn: "Fresh and healthy breakfast options",
        descriptionAr: "خيارات إفطار طازجة وصحية",
        slug: "breakfast",
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 2
      },
      {
        id: 5,
        nameEn: "Main Dishes",
        nameAr: "الأطباق الرئيسية",
        descriptionEn: "Hearty meals and savory delights",
        descriptionAr: "وجبات شهية ولذائذ مالحة",
        slug: "main-dishes",
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 6
      },
      {
        id: 6,
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

    // Seed Products
    console.log("🚗 Seeding products...");
    const productsData = [
      // Thermal Insulator
      {
        id: 1,
        nameEn: "Ceramic Thermal Coating",
        nameAr: "طلاء سيراميك حراري",
        descriptionEn: "Advanced ceramic coating for maximum heat insulation and protection",
        descriptionAr: "طلاء سيراميك متقدم لأقصى عزل حراري وحماية",
        price: "70.00",
        categoryId: 1,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 50,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 1
      },
      {
        id: 2,
        nameEn: "Heat Resistant Film",
        nameAr: "فيلم مقاوم للحرارة",
        descriptionEn: "Premium heat resistant window film for UV protection",
        descriptionAr: "فيلم نوافذ مقاوم للحرارة فاخر للحماية من الأشعة فوق البنفسجية",
        price: "37.00",
        categoryId: 1,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 30,
        isActive: true,
        isFeatured: false,
        isAvailable: true,
        sortOrder: 2
      },
      
      // Thermal Insulation Protection
      {
        id: 3,
        nameEn: "Full Body Protection System",
        nameAr: "نظام حماية كامل للجسم",
        descriptionEn: "Complete thermal insulation protection for entire vehicle body",
        descriptionAr: "حماية عزل حراري كاملة لجسم السيارة بالكامل",
        price: "98.00",
        categoryId: 2,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 20,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 1
      },
      {
        id: 4,
        nameEn: "Engine Bay Protection",
        nameAr: "حماية حجرة المحرك",
        descriptionEn: "Specialized thermal protection for engine compartment",
        descriptionAr: "حماية حرارية متخصصة لحجرة المحرك",
        price: "53.00",
        categoryId: 2,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 25,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 2
      },
      
      // Protection Services
      {
        id: 5,
        nameEn: "Paint Protection Film",
        nameAr: "فيلم حماية الطلاء",
        descriptionEn: "Premium paint protection film for vehicle exterior",
        descriptionAr: "فيلم حماية طلاء فاخر للجزء الخارجي للمركبة",
        price: "78.00",
        categoryId: 3,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 15,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 1
      },
      {
        id: 6,
        nameEn: "Ceramic Coating Protection",
        nameAr: "حماية الطلاء السيراميكي",
        descriptionEn: "Advanced ceramic coating for long-lasting protection",
        descriptionAr: "طلاء سيراميكي متقدم للحماية طويلة المدى",
        price: "64.00",
        categoryId: 3,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 25,
        isActive: true,
        isFeatured: false,
        isAvailable: true,
        sortOrder: 2
      },
      {
        id: 7,
        nameEn: "Interior Protection Package",
        nameAr: "حزمة حماية داخلية",
        descriptionEn: "Complete interior protection with leather and fabric treatment",
        descriptionAr: "حماية داخلية كاملة مع معالجة الجلد والقماش",
        price: "45.00",
        categoryId: 3,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 30,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 3
      },

      // Polish Services
      {
        id: 8,
        nameEn: "Premium Car Polish",
        nameAr: "تلميع سيارات فاخر",
        descriptionEn: "Professional car polishing service with premium products",
        descriptionAr: "خدمة تلميع سيارات احترافية بمنتجات فاخرة",
        price: "29.00",
        categoryId: 4,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 50,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 1
      },
      {
        id: 9,
        nameEn: "Ceramic Polish Coating",
        nameAr: "طلاء تلميع سيراميكي",
        descriptionEn: "Advanced ceramic polish coating for long-lasting shine",
        descriptionAr: "طلاء تلميع سيراميكي متقدم للمعان طويل المدى",
        price: "39.00",
        categoryId: 4,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 40,
        isActive: true,
        isFeatured: false,
        isAvailable: true,
        sortOrder: 2
      },
      {
        id: 10,
        nameEn: "Headlight Restoration",
        nameAr: "ترميم المصابيح الأمامية",
        descriptionEn: "Professional headlight restoration and polishing service",
        descriptionAr: "خدمة ترميم وتلميع المصابيح الأمامية الاحترافية",
        price: "15.00",
        categoryId: 4,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 30,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 3
      },

      // Breakfast
      {
        id: 14,
        nameEn: "Avocado Toast",
        nameAr: "توست الأفوكادو",
        descriptionEn: "Fresh avocado on toasted artisan bread with herbs",
        descriptionAr: "أفوكادو طازج على خبز حرفي محمص مع الأعشاب",
        price: "2.30",
        categoryId: 4,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 30,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 14
      },
      {
        id: 15,
        nameEn: "Croissant",
        nameAr: "كرواسون",
        descriptionEn: "Buttery, flaky French pastry baked fresh daily",
        descriptionAr: "معجنات فرنسية مقرمشة بالزبدة مخبوزة طازجة يومياً",
        price: "15.00",
        categoryId: 4,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 25,
        isActive: true,
        isFeatured: false,
        isAvailable: true,
        sortOrder: 13
      },

      // Main Dishes
      {
        id: 16,
        nameEn: "Grilled Chicken Sandwich",
        nameAr: "ساندويتش دجاج مشوي",
        descriptionEn: "Tender grilled chicken with fresh vegetables",
        descriptionAr: "دجاج مشوي طري مع خضروات طازجة",
        price: "45.00",
        categoryId: 5,
        image: "/uploads/image-1750619498223-468154478.png",
        stock: 20,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 17
      },
      {
        id: 17,
        nameEn: "Caesar Salad",
        nameAr: "سلطة قيصر",
        descriptionEn: "Crisp romaine lettuce with parmesan and croutons",
        descriptionAr: "خس روماني مقرمش مع البارميزان والخبز المحمص",
        price: "35.00",
        categoryId: 5,
        image: "/uploads/image-1750619698116-866726810.png",
        stock: 25,
        isActive: true,
        isFeatured: false,
        isAvailable: true,
        sortOrder: 16
      },

      // Desserts
      {
        id: 18,
        nameEn: "Chocolate Cake",
        nameAr: "كعكة الشوكولاتة",
        descriptionEn: "Rich dark chocolate cake with smooth ganache",
        descriptionAr: "كعكة شوكولاتة داكنة غنية مع جاناش ناعم",
        price: "25.00",
        categoryId: 6,
        image: "/uploads/image-1750619092534-536966498.png",
        stock: 15,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 18
      },
      {
        id: 19,
        nameEn: "Tiramisu",
        nameAr: "تيراميسو",
        descriptionEn: "Classic Italian dessert with coffee and mascarpone",
        descriptionAr: "حلوى إيطالية كلاسيكية مع القهوة والماسكاربوني",
        price: "30.00",
        categoryId: 6,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 12,
        isActive: true,
        isFeatured: false,
        isAvailable: true,
        sortOrder: 20
      }
    ];

    await db.insert(products).values(productsData).onConflictDoNothing();

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

    // Seed About Us
    console.log("ℹ️ Seeding about us...");
    await db.insert(aboutUs).values({
      id: 1,
      titleEn: "About Action Protection",
      titleAr: "حول أكشن بروتكشن",
      contentEn: `Welcome to Action Protection, where automotive excellence meets advanced protection technology. Our passion for preserving luxury vehicles drives everything we do, from cutting-edge thermal insulation to premium protective coatings.

Founded with a vision to revolutionize vehicle protection in the region, we take pride in our innovative approach to automotive care and our unwavering commitment to excellence.

Our certified technicians apply each protection layer with precision and expertise, ensuring that every vehicle receives the ultimate defense against environmental hazards. Whether you drive a luxury sedan, premium SUV, or high-performance sports car, Action Protection delivers comprehensive solutions tailored to your needs.

We believe in using only the finest materials and proven technologies, which is why we partner with leading global manufacturers of automotive protection products. Our services include thermal insulation, paint protection films, ceramic coatings, and professional detailing.

Trust us to safeguard your investment with unmatched quality and professional service that exceeds expectations.`,
      contentAr: `مرحباً بكم في أكشن بروتكشن، حيث يلتقي التميز السيارات بتكنولوجيا الحماية المتقدمة. شغفنا بالحفاظ على المركبات الفاخرة يقود كل ما نقوم به، من العزل الحراري المتطور إلى الطلاءات الواقية المتميزة.

تأسسنا برؤية لثورة حماية المركبات في المنطقة، ونفخر بنهجنا المبتكر في العناية بالسيارات والتزامنا الثابت بالتميز.

يطبق فنيونا المعتمدون كل طبقة حماية بدقة وخبرة، مما يضمن أن كل مركبة تحصل على الدفاع الأقصى ضد المخاطر البيئية. سواء كنتم تقودون سيارة فاخرة أو سيارة دفع رباعي متميزة أو سيارة رياضية عالية الأداء، توفر أكشن بروتكشن حلولاً شاملة مصممة خصيصاً لاحتياجاتكم.

نؤمن باستخدام أجود المواد والتقنيات المجربة فقط، ولهذا نتشارك مع الشركات المصنعة العالمية الرائدة لمنتجات حماية السيارات. تشمل خدماتنا العزل الحراري وأفلام حماية الطلاء والطلاءات السيراميكية والتنظيف الاحترافي.

ثقوا بنا لحماية استثماركم بجودة لا مثيل لها وخدمة احترافية تفوق التوقعات.`,
      features: JSON.stringify([
        {
          icon: "Shield",
          titleEn: "Advanced Protection",
          titleAr: "حماية متقدمة",
          descEn: "State-of-the-art protection technology for your luxury vehicle",
          descAr: "تكنولوجيا حماية متطورة لمركبتكم الفاخرة"
        },
        {
          icon: "Award", 
          titleEn: "Certified Excellence",
          titleAr: "تميز معتمد",
          descEn: "Certified technicians with years of automotive protection expertise",
          descAr: "فنيون معتمدون بخبرة سنوات في حماية السيارات"
        },
        {
          icon: "Users",
          titleEn: "Customer Focused",
          titleAr: "تركيز على العملاء", 
          descEn: "Personalized service tailored to each vehicle's specific needs",
          descAr: "خدمة شخصية مصممة لاحتياجات كل مركبة"
        },
        {
          icon: "Clock",
          titleEn: "Timely Service",
          titleAr: "خدمة في الوقت المحدد",
          descEn: "Efficient service delivery without compromising on quality",
          descAr: "تسليم خدمة فعال دون التنازل عن الجودة"
        }
      ]),
      missionEn: "To provide world-class vehicle protection services that preserve and enhance the value of luxury automobiles through innovative technology and exceptional craftsmanship.",
      missionAr: "تقديم خدمات حماية المركبات عالمية المستوى التي تحافظ على قيمة السيارات الفاخرة وتعززها من خلال التكنولوجيا المبتكرة والحرفية الاستثنائية.",
      image: "/assets/image_2025-06-28_16-00-46_1751115667732.png",
      isActive: true
    }).onConflictDoNothing();

    // Seed Contact Us
    console.log("📞 Seeding contact us...");
    await db.insert(contactUs).values({
      id: 1,
      phone: "+965 2245 0123",
      whatsapp: "+965 9988 7766",
      email: "info@actionprotection.kw",
      address: "123 Al-Salam Street, Kuwait City, Kuwait",
      addressAr: "123 شارع السلام، مدينة الكويت، الكويت",
      workingHours: "Sunday - Thursday: 8:00 AM - 6:00 PM",
      workingHoursAr: "الأحد - الخميس: 8:00 ص - 6:00 م",
      socialMediaLinks: JSON.stringify({
        instagram: "https://instagram.com/actionprotection",
        twitter: "https://twitter.com/actionprotection",
        facebook: "https://facebook.com/actionprotection",
        snapchat: "https://snapchat.com/add/actionprotection",
        linkedin: "https://linkedin.com/company/actionprotection",
        youtube: "https://youtube.com/actionprotection",
        tiktok: "https://tiktok.com/@actionprotection"
      }),
      googleMapsUrl: "https://maps.google.com/?q=Kuwait+City+Kuwait",
      isActive: true
    }).onConflictDoNothing();

    // Seed Footer Content
    console.log("🦶 Seeding footer content...");
    await db.insert(footerContent).values({
      id: 1,
      companyNameEn: "Action Protection",
      companyNameAr: "أكشن بروتكشن",
      descriptionEn: "Professional vehicle protection services in Kuwait. We accept Visa, KNET, and Apple Pay for your convenience.",
      descriptionAr: "خدمات حماية المركبات الاحترافية في الكويت. نقبل فيزا وكي نت وأبل باي لراحتكم.",
      copyrightText: "© 2025 Action Protection. All rights reserved.",
      quickLinks: JSON.stringify([
        { nameEn: "About Us", nameAr: "من نحن", url: "/about" },
        { nameEn: "Services", nameAr: "الخدمات", url: "/services" },
        { nameEn: "Contact", nameAr: "اتصل بنا", url: "/contact" },
        { nameEn: "Privacy Policy", nameAr: "سياسة الخصوصية", url: "/privacy-policy" }
      ]),
      isActive: true
    }).onConflictDoNothing();

    // Seed Widget Settings
    console.log("🎛️ Seeding widget settings...");
    const widgetData = [
      {
        name: "site_logo",
        titleEn: "Site Logo",
        titleAr: "شعار الموقع",
        settings: JSON.stringify({
          valueEn: "/assets/english-white.png",
          valueAr: "/assets/arabic-white.png"
        }),
        isActive: true
      },
      {
        name: "site_logo_dark",
        titleEn: "Site Logo Dark",
        titleAr: "شعار الموقع الداكن",
        settings: JSON.stringify({
          valueEn: "/assets/english-dark.png",
          valueAr: "/assets/arabic-dark.png"
        }),
        isActive: true
      },
      {
        name: "hero_title",
        titleEn: "Hero Title",
        titleAr: "عنوان البطل",
        settings: JSON.stringify({
          valueEn: "Welcome to LateLounge",
          valueAr: "مرحباً بكم في ليت لاونج"
        }),
        isActive: true
      },
      {
        name: "tawk_chat",
        titleEn: "Tawk.to Chat Widget",
        titleAr: "ودجت الدردشة",
        settings: JSON.stringify({
          valueEn: "67667a234304e3196ae82c84",
          valueAr: "67667a234304e3196ae82c84",
          descriptionEn: "Tawk.to Property ID for chat widget",
          descriptionAr: "معرف خاصية Tawk.to لودجت الدردشة"
        }),
        isActive: true
      }
    ];

    await db.insert(widgetSettings).values(widgetData).onConflictDoNothing();

    // Seed Privacy Policy
    console.log("🔒 Seeding privacy policy...");
    await db.insert(privacyPolicy).values({
      id: 1,
      titleEn: "Privacy Policy",
      titleAr: "سياسة الخصوصية",
      contentEn: `At LateLounge, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or use our services.

**Information We Collect**
- Personal information such as name, email, and phone number when you contact us
- Usage data including IP address, browser type, and pages visited
- Cookies and similar tracking technologies for website functionality

**How We Use Your Information**
- To provide and improve our services
- To respond to your inquiries and requests
- To send promotional materials (with your consent)
- To analyze website usage and improve user experience

**Data Protection**
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

**Your Rights**
You have the right to access, update, or delete your personal information. Contact us if you wish to exercise these rights.

**Contact Us**
For any privacy-related questions, please contact us at privacy@latelounge.sa`,
      contentAr: `في ليت لاونج، نقدر خصوصيتكم ونلتزم بحماية معلوماتكم الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية بياناتكم عند زيارة موقعنا أو استخدام خدماتنا.

**المعلومات التي نجمعها**
- المعلومات الشخصية مثل الاسم والبريد الإلكتروني ورقم الهاتف عند التواصل معنا
- بيانات الاستخدام بما في ذلك عنوان IP ونوع المتصفح والصفحات المزارة
- ملفات تعريف الارتباط والتقنيات المشابهة لوظائف الموقع

**كيفية استخدام معلوماتكم**
- لتقديم وتحسين خدماتنا
- للرد على استفساراتكم وطلباتكم
- لإرسال المواد الترويجية (بموافقتكم)
- لتحليل استخدام الموقع وتحسين تجربة المستخدم

**حماية البيانات**
نطبق التدابير الأمنية المناسبة لحماية معلوماتكم الشخصية ضد الوصول غير المصرح به أو التعديل أو الكشف أو التدمير.

**حقوقكم**
لديكم الحق في الوصول إلى معلوماتكم الشخصية أو تحديثها أو حذفها. اتصلوا بنا إذا كنتم ترغبون في ممارسة هذه الحقوق.

**اتصلوا بنا**
لأي أسئلة متعلقة بالخصوصية، يرجى التواصل معنا على privacy@latelounge.sa`,
      isActive: true
    }).onConflictDoNothing();

    // Seed Terms of Service
    console.log("📋 Seeding terms of service...");
    await db.insert(termsOfService).values({
      id: 1,
      titleEn: "Terms of Service",
      titleAr: "شروط الخدمة",
      contentEn: `Welcome to LateLounge. By accessing our website and using our services, you agree to comply with these Terms of Service.

**Use of Services**
- Our services are provided for personal, non-commercial use
- You must be at least 18 years old to use our services
- You agree to provide accurate information when requested

**Prohibited Activities**
- Violating any applicable laws or regulations
- Interfering with the proper functioning of our website
- Attempting to gain unauthorized access to our systems

**Intellectual Property**
All content on our website, including text, images, logos, and designs, is protected by copyright and other intellectual property laws.

**Limitation of Liability**
LateLounge shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.

**Modifications**
We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.

**Contact Information**
For questions about these Terms of Service, contact us at legal@latelounge.sa`,
      contentAr: `مرحباً بكم في ليت لاونج. من خلال الوصول إلى موقعنا واستخدام خدماتنا، فإنكم توافقون على الامتثال لشروط الخدمة هذه.

**استخدام الخدمات**
- تُقدم خدماتنا للاستخدام الشخصي غير التجاري
- يجب أن تكونوا بعمر 18 عاماً على الأقل لاستخدام خدماتنا
- توافقون على تقديم معلومات دقيقة عند الطلب

**الأنشطة المحظورة**
- انتهاك أي قوانين أو لوائح سارية
- التدخل في الأداء السليم لموقعنا
- محاولة الحصول على وصول غير مصرح به لأنظمتنا

**الملكية الفكرية**
جميع المحتويات على موقعنا، بما في ذلك النصوص والصور والشعارات والتصاميم، محمية بحقوق الطبع والنشر وقوانين الملكية الفكرية الأخرى.

**تحديد المسؤولية**
لن يكون ليت لاونج مسؤولاً عن أي أضرار غير مباشرة أو عرضية أو تبعية تنشأ من استخدامكم لخدماتنا.

**التعديلات**
نحتفظ بالحق في تعديل هذه الشروط في أي وقت. ستصبح التغييرات سارية فور النشر.

**معلومات الاتصال**
للأسئلة حول شروط الخدمة هذه، اتصلوا بنا على legal@latelounge.sa`,
      isActive: true
    }).onConflictDoNothing();

    // Seed Experience Section
    console.log("🎬 Seeding experience section...");
    await db.insert(experienceSection).values({
      titleEn: "EXPERIENCE TRUE LUXURY",
      titleAr: "اختبر الفخامة الحقيقية",
      descriptionEn: "Discover premium vehicle protection services that exceed expectations with our state-of-the-art facilities and expert technicians.",
      descriptionAr: "اكتشف خدمات حماية المركبات المتميزة التي تتجاوز التوقعات مع مرافقنا الحديثة والفنيين الخبراء.",
      video1Url: "/assets/social_u4193187385_A_cinematic_image_of_a_ROLLS_ROYC_positioned_on_t_ee453847-f0d0-485f-8be3-ebc7036dc483_3_1751053253358.mp4",
      video2Url: "/assets/social_u4193187385_A_cinematic_image_of_a_Mercedes_G-Class_positione_22e6c30d-a357-49c5-bf82-4a9fe0b50e8d_0_1751049968234.mp4",
      text1En: "YOUR CAR IS SPECIAL WITH US",
      text1Ar: "سيارتك متميزة معانا",
      text2En: "SUPERIOR PROTECTION FOR LUXURY CARS",
      text2Ar: "حماية فائقة للسيارات الفاخرة",
      isActive: true
    }).onConflictDoNothing();

    console.log("✅ Production data seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding production data:", error);
    throw error;
  }
}