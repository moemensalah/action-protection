import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Footer } from "@/components/Footer";
import { SEO, getBreadcrumbSchema } from "@/components/SEO";
import { Coffee, Users, Award, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AboutUs {
  id: number;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  image: string;
  mapUrl?: string;
  isActive: boolean;
}

export default function About() {
  const { t, isRTL } = useLanguage();

  const { data: aboutData } = useQuery<AboutUs>({
    queryKey: ["/api/about"],
  });
  
  const breadcrumbItems = [
    { name: t("home"), url: "/" },
    { name: t("about"), url: "/about" }
  ];

  const features = [
    {
      icon: Coffee,
      titleEn: "Premium Coffee",
      titleAr: "قهوة فاخرة",
      descEn: "We source the finest coffee beans from around the world to create exceptional blends.",
      descAr: "نحن نحصل على أفضل حبوب القهوة من جميع أنحاء العالم لصنع خلطات استثنائية.",
    },
    {
      icon: Users,
      titleEn: "Expert Team",
      titleAr: "فريق خبير",
      descEn: "Our skilled baristas and chefs bring years of experience to every cup and dish.",
      descAr: "يجلب باريستا والطهاة المهرة لدينا سنوات من الخبرة إلى كل كوب وطبق.",
    },
    {
      icon: Award,
      titleEn: "Award Winning",
      titleAr: "حائز على جوائز",
      descEn: "Recognized for excellence in both coffee quality and customer service.",
      descAr: "معترف به للتميز في جودة القهوة وخدمة العملاء.",
    },
    {
      icon: Clock,
      titleEn: "Always Fresh",
      titleAr: "طازج دائماً",
      descEn: "We roast our beans daily and prepare everything fresh to order.",
      descAr: "نحمص حبوبنا يومياً ونحضر كل شيء طازجاً حسب الطلب.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <SEO 
        title={isRTL ? "من نحن" : "About Us"}
        description={isRTL 
          ? "تعرف على قصة ليت لاونج وشغفنا بتقديم أفضل تجربة قهوة. فريقنا المتخصص يعمل على تحضير أجود أنواع القهوة والمأكولات في بيئة مريحة ودافئة."
          : "Learn about LateLounge's story and our passion for delivering the finest coffee experience. Our dedicated team crafts premium coffee and culinary delights in a comfortable, welcoming environment."
        }
        keywords={isRTL
          ? "من نحن, قصة ليت لاونج, فريق العمل, تجربة القهوة, جودة الخدمة, بيئة مريحة"
          : "about us, LateLounge story, team, coffee experience, quality service, comfortable environment"
        }
        url="/about"
        type="website"
        structuredData={getBreadcrumbSchema(breadcrumbItems)}
      />
      <AnimatedBackground />
      {/* Hero Section */}
      <section className="relative h-64 gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-black/50"></div>
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isRTL ? "من نحن" : "About Us"}
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              {isRTL 
                ? "اكتشف قصة شغفنا بالقهوة والمأكولات الفاخرة" 
                : "Discover the story behind our passion for exceptional coffee and cuisine"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white dark:bg-gray-900 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {aboutData ? 
                  (isRTL ? aboutData.titleAr : aboutData.titleEn) :
                  (isRTL ? "قصتنا" : "Our Story")
                }
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {aboutData ? (
                  <div 
                    dangerouslySetInnerHTML={{
                      __html: isRTL ? aboutData.contentAr : aboutData.contentEn
                    }}
                  />
                ) : (
                  <>
                    <p>
                      {isRTL 
                        ? "تأسس كافيه عربيكا عام 2015 بحلم بسيط: إنشاء مساحة حيث يمكن للناس الاستمتاع بأفضل أنواع القهوة والطعام في أجواء دافئة ومرحبة."
                        : "Café Arabica was founded in 2015 with a simple dream: to create a space where people could enjoy the finest coffee and food in a warm, welcoming atmosphere."
                      }
                    </p>
                    <p>
                      {isRTL 
                        ? "بدأنا كمحمصة صغيرة للقهوة، ونمونا لنصبح وجهة محبوبة لعشاق القهوة وعشاق الطعام على حد سواء. رحلتنا هي واحدة من الشغف والتفاني والسعي المستمر للتميز."
                        : "What started as a small coffee roastery has grown into a beloved destination for coffee enthusiasts and food lovers alike. Our journey has been one of passion, dedication, and a relentless pursuit of excellence."
                      }
                    </p>
                    <p>
                      {isRTL 
                        ? "اليوم، نواصل التزامنا بتقديم تجربة استثنائية، من حبة القهوة إلى الكوب، ومن المكونات الطازجة إلى الأطباق المصنوعة بعناية."
                        : "Today, we continue our commitment to delivering an exceptional experience, from bean to cup, and from fresh ingredients to carefully crafted dishes."
                      }
                    </p>
                  </>  
                )}
              </div>
            </div>
            
            <div className="relative">
              <img
                src={aboutData?.image || "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                alt={aboutData ? (isRTL ? aboutData.titleAr : aboutData.titleEn) : "Café Interior"}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              {isRTL ? "ما يميزنا" : "What Makes Us Special"}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {isRTL ? feature.titleAr : feature.titleEn}
                    </h3>
                    <p className="text-muted-foreground">
                      {isRTL ? feature.descAr : feature.descEn}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {isRTL ? "مهمتنا" : "Our Mission"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {isRTL 
                ? "مهمتنا هي إنشاء تجارب لا تُنسى من خلال تقديم قهوة استثنائية ومأكولات لذيذة وخدمة ودودة. نحن نؤمن بأن كل كوب يحكي قصة، وكل وجبة تخلق ذكريات، وكل زيارة يجب أن تجعلك تشعر وكأنك في المنزل."
                : "Our mission is to create unforgettable experiences through exceptional coffee, delicious food, and warm hospitality. We believe that every cup tells a story, every meal creates memories, and every visit should make you feel at home."
              }
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}