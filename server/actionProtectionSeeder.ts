import { db } from "./db";
import { categories, products, footerContent, contactUs, aboutUs } from "@shared/schema";

export async function seedActionProtectionData() {
  try {
    console.log("🚗 Starting Action Protection data seeding...");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(products);
    await db.delete(categories);
    await db.delete(footerContent);
    await db.delete(contactUs);
    await db.delete(aboutUs);

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
        image: "https://images.unsplash.com/photo-1609205807107-e4ec2120c5b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
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
        image: "https://images.unsplash.com/photo-1609205807107-e4ec2120c5b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
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
        image: "https://images.unsplash.com/photo-1563436589-0a6c8b59a0b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
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
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
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
        image: "https://images.unsplash.com/photo-1520340149328-78e7e6bb4692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
        sortOrder: 5
      }
    ];

    await db.insert(categories).values(categoriesData);

    // Seed Products
    console.log("🔧 Seeding products...");
    const productsData = [
      // Thermal Insulator
      {
        id: 1,
        nameEn: "Ceramic Thermal Coating",
        nameAr: "طلاء سيراميك حراري",
        descriptionEn: "Advanced ceramic coating for maximum heat insulation and protection",
        descriptionAr: "طلاء سيراميك متقدم لأقصى عزل حراري وحماية",
        price: "850.00",
        categoryId: 1,
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 50,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 1
      },
      {
        id: 2,
        nameEn: "Heat Resistant Window Film",
        nameAr: "فيلم نوافذ مقاوم للحرارة",
        descriptionEn: "Premium heat resistant window film for UV protection and thermal insulation",
        descriptionAr: "فيلم نوافذ مقاوم للحرارة فاخر للحماية من الأشعة فوق البنفسجية والعزل الحراري",
        price: "450.00",
        categoryId: 1,
        image: "https://images.unsplash.com/photo-1609205807107-e4ec2120c5b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
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
        price: "1200.00",
        categoryId: 2,
        image: "https://images.unsplash.com/photo-1563436589-0a6c8b59a0b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 20,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 1
      },
      {
        id: 4,
        nameEn: "Engine Bay Thermal Protection",
        nameAr: "حماية حرارية لحجرة المحرك",
        descriptionEn: "Specialized thermal protection for engine compartment and components",
        descriptionAr: "حماية حرارية متخصصة لحجرة المحرك ومكوناتها",
        price: "650.00",
        categoryId: 2,
        image: "https://images.unsplash.com/photo-1520340149328-78e7e6bb4692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 25,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 2
      },
      
      // Protection Services
      {
        id: 5,
        nameEn: "Paint Protection Film (PPF)",
        nameAr: "فيلم حماية الطلاء",
        descriptionEn: "Premium paint protection film for vehicle exterior surface protection",
        descriptionAr: "فيلم حماية طلاء فاخر لحماية السطح الخارجي للمركبة",
        price: "950.00",
        categoryId: 3,
        image: "https://images.unsplash.com/photo-1563436589-0a6c8b59a0b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
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
        descriptionEn: "Advanced ceramic coating for long-lasting paint protection and shine",
        descriptionAr: "طلاء سيراميكي متقدم للحماية طويلة المدى واللمعان",
        price: "780.00",
        categoryId: 3,
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
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
        price: "550.00",
        categoryId: 3,
        image: "https://images.unsplash.com/photo-1520340149328-78e7e6bb4692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
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
        descriptionEn: "Professional car polishing service with premium products and techniques",
        descriptionAr: "خدمة تلميع سيارات احترافية بمنتجات وتقنيات فاخرة",
        price: "350.00",
        categoryId: 4,
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
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
        descriptionEn: "Advanced ceramic polish coating for long-lasting shine and protection",
        descriptionAr: "طلاء تلميع سيراميكي متقدم للمعان والحماية طويلة المدى",
        price: "480.00",
        categoryId: 4,
        image: "https://images.unsplash.com/photo-1609205807107-e4ec2120c5b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 40,
        isActive: true,
        isFeatured: false,
        isAvailable: true,
        sortOrder: 2
      },
      {
        id: 10,
        nameEn: "Headlight Restoration & Polish",
        nameAr: "ترميم وتلميع المصابيح الأمامية",
        descriptionEn: "Professional headlight restoration and polishing service for clarity",
        descriptionAr: "خدمة ترميم وتلميع المصابيح الأمامية الاحترافية للوضوح",
        price: "180.00",
        categoryId: 4,
        image: "https://images.unsplash.com/photo-1520340149328-78e7e6bb4692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 30,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 3
      },
      
      // Painting and Vacuuming Services
      {
        id: 11,
        nameEn: "Full Vehicle Paint Job",
        nameAr: "طلاء كامل للمركبة",
        descriptionEn: "Complete professional vehicle painting with premium quality automotive paint",
        descriptionAr: "طلاء احترافي كامل للمركبة بطلاء سيارات عالي الجودة",
        price: "2500.00",
        categoryId: 5,
        image: "https://images.unsplash.com/photo-1520340149328-78e7e6bb4692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 10,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 1
      },
      {
        id: 12,
        nameEn: "Touch-up Paint Service",
        nameAr: "خدمة الطلاء التصحيحي",
        descriptionEn: "Professional touch-up painting for scratches and minor damage repair",
        descriptionAr: "طلاء تصحيحي احترافي لإصلاح الخدوش والأضرار الطفيفة",
        price: "320.00",
        categoryId: 5,
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 25,
        isActive: true,
        isFeatured: false,
        isAvailable: true,
        sortOrder: 2
      },
      {
        id: 13,
        nameEn: "Deep Interior Vacuuming",
        nameAr: "تنظيف داخلي عميق",
        descriptionEn: "Comprehensive interior cleaning and vacuuming service for all surfaces",
        descriptionAr: "خدمة تنظيف وشفط داخلي شاملة لجميع الأسطح",
        price: "150.00",
        categoryId: 5,
        image: "https://images.unsplash.com/photo-1609205807107-e4ec2120c5b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 40,
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        sortOrder: 3
      },
      {
        id: 14,
        nameEn: "Engine Bay Cleaning",
        nameAr: "تنظيف حجرة المحرك",
        descriptionEn: "Professional engine bay cleaning and detailing service with degreasing",
        descriptionAr: "خدمة تنظيف وتفصيل حجرة المحرك الاحترافية مع إزالة الشحوم",
        price: "200.00",
        categoryId: 5,
        image: "https://images.unsplash.com/photo-1563436589-0a6c8b59a0b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        stock: 30,
        isActive: true,
        isFeatured: false,
        isAvailable: true,
        sortOrder: 4
      }
    ];

    await db.insert(products).values(productsData);

    // Seed Footer Content
    console.log("📄 Seeding footer content...");
    const footerData = {
      id: 1,
      companyNameEn: "Action Protection",
      companyNameAr: "أكشن بروتكشن",
      descriptionEn: "Professional vehicle protection services with advanced thermal insulation, paint protection, polishing, and cleaning solutions.",
      descriptionAr: "خدمات حماية المركبات الاحترافية مع العزل الحراري المتقدم وحماية الطلاء والتلميع والتنظيف.",
      copyrightText: "© 2025 Action Protection. All rights reserved.",
      quickLinks: [
        { nameEn: "Services", nameAr: "الخدمات", url: "/menu" },
        { nameEn: "About Us", nameAr: "من نحن", url: "/about" },
        { nameEn: "Contact", nameAr: "اتصل بنا", url: "/contact" }
      ],
      isActive: true
    };

    await db.insert(footerContent).values(footerData);

    // Seed Contact Information
    console.log("📞 Seeding contact information...");
    const contactData = {
      id: 1,
      phone: "+966 11 555 0123",
      whatsapp: "+966 50 123 4567",
      email: "info@actionprotection.sa",
      address: "123 King Fahd Road, Riyadh, Saudi Arabia",
      addressAr: "123 طريق الملك فهد، الرياض، المملكة العربية السعودية",
      workingHours: "Sunday - Thursday: 8:00 AM - 6:00 PM",
      workingHoursAr: "الأحد - الخميس: 8:00 ص - 6:00 م",
      socialMediaLinks: {
        facebook: "https://facebook.com/actionprotection",
        instagram: "https://instagram.com/actionprotection",
        twitter: "https://twitter.com/actionprotection",
        youtube: "https://youtube.com/actionprotection",
        linkedin: "https://linkedin.com/company/actionprotection",
        tiktok: "https://tiktok.com/@actionprotection",
        snapchat: "https://snapchat.com/add/actionprotection"
      },
      googleMapsUrl: "https://maps.google.com/?q=Riyadh+Saudi+Arabia",
      isActive: true
    };

    await db.insert(contactUs).values(contactData);

    // Seed About Us
    console.log("ℹ️ Seeding about us content...");
    const aboutData = {
      id: 1,
      titleEn: "About Action Protection",
      titleAr: "حول أكشن بروتكشن",
      contentEn: "Action Protection is a leading automotive protection service provider in Saudi Arabia, specializing in advanced thermal insulation, paint protection, professional polishing, and comprehensive cleaning services. We use cutting-edge technology and premium materials to ensure your vehicle receives the highest level of protection and care.",
      contentAr: "أكشن بروتكشن هو مزود خدمات حماية السيارات الرائد في المملكة العربية السعودية، متخصص في العزل الحراري المتقدم وحماية الطلاء والتلميع الاحترافي وخدمات التنظيف الشاملة. نحن نستخدم التكنولوجيا المتطورة والمواد الفاخرة لضمان حصول مركبتك على أعلى مستوى من الحماية والعناية.",
      missionEn: "To provide exceptional vehicle protection services that exceed customer expectations while maintaining the highest standards of quality and professionalism.",
      missionAr: "تقديم خدمات حماية مركبات استثنائية تتجاوز توقعات العملاء مع الحفاظ على أعلى معايير الجودة والاحترافية.",
      features: [
        {
          icon: "shield",
          titleEn: "Advanced Protection",
          titleAr: "حماية متقدمة",
          descEn: "State-of-the-art protection solutions for all vehicle types",
          descAr: "حلول حماية حديثة لجميع أنواع المركبات"
        },
        {
          icon: "zap",
          titleEn: "Premium Quality",
          titleAr: "جودة فاخرة",
          descEn: "Only the finest materials and proven techniques",
          descAr: "أجود المواد والتقنيات المجربة فقط"
        },
        {
          icon: "users",
          titleEn: "Expert Team",
          titleAr: "فريق خبراء",
          descEn: "Certified professionals with years of experience",
          descAr: "متخصصون معتمدون بسنوات من الخبرة"
        }
      ],
      image: "https://images.unsplash.com/photo-1563436589-0a6c8b59a0b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      isActive: true
    };

    await db.insert(aboutUs).values(aboutData);

    console.log("✅ Action Protection data seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding Action Protection data:", error);
    throw error;
  }
}