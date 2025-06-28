import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Footer } from "@/components/Footer";
import { SEO, getBreadcrumbSchema } from "@/components/SEO";
import { Coffee, Users, Award, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Feature {
  icon: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
}

interface AboutUs {
  id: number;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  features: Feature[];
  missionEn?: string;
  missionAr?: string;
  image: string;
  mapUrl?: string;
  isActive: boolean;
}

// Icon mapping function
const getIcon = (iconName: string) => {
  const icons: { [key: string]: any } = {
    Coffee,
    Users,
    Award,
    Clock,
  };
  return icons[iconName] || Coffee;
};

export default function About() {
  const { t, isRTL } = useLanguage();

  const { data: aboutData, isLoading } = useQuery<AboutUs>({
    queryKey: ["/api/about"],
  });
  
  const breadcrumbItems = [
    { name: t("home"), url: "/" },
    { name: t("about"), url: "/about" }
  ];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <SEO 
        title={isRTL ? "من نحن" : "About Us"}
        description={isRTL 
          ? "تعرف على قصة أكشن بروتكشن وخبرتنا في حماية المركبات الفاخرة. فريقنا المتخصص يقدم أفضل خدمات العزل الحراري والطلاء الواقي والتلميع المتقدم."
          : "Learn about Action Protection's story and our expertise in luxury vehicle protection. Our specialized team delivers premium thermal insulation, protective coating, and advanced polishing services."
        }
        keywords={isRTL
          ? "من نحن, أكشن بروتكشن, حماية المركبات, العزل الحراري, الطلاء الواقي, تلميع السيارات"
          : "about us, Action Protection, vehicle protection, thermal insulation, protective coating, car polishing"
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
          className="absolute inset-0 opacity-40 animate-ken-burns"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Animated gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20 animate-gradient-x"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-pulse-slow"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float-1"></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-300/40 rounded-full animate-float-2"></div>
          <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-float-3"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-300/30 rounded-full animate-float-1"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
              {isRTL ? "من نحن" : "About Us"}
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl animate-fade-in-up animation-delay-300">
              {isRTL 
                ? "اكتشف قصة شغفنا بحماية المركبات والخدمات المتميزة" 
                : "Discover the story behind our passion for vehicle protection and exceptional service"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-16 bg-white dark:bg-gray-900 theme-transition overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full animate-float-1"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full animate-float-2"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-green-500 rounded-full animate-float-3"></div>
          <div className="absolute bottom-40 right-1/4 w-20 h-20 bg-blue-400 rounded-full animate-float-1"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              {isLoading ? (
                <div className="space-y-6">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5 animate-pulse"></div>
                  </div>
                </div>
              ) : aboutData ? (
                <>
                  <h2 className="text-3xl font-bold text-foreground mb-6">
                    {isRTL ? aboutData.titleAr : aboutData.titleEn}
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <div 
                      dangerouslySetInnerHTML={{
                        __html: isRTL ? aboutData.contentAr : aboutData.contentEn
                      }}
                    />
                  </div>
                </>
              ) : null}
            </div>
            
            <div className="relative">
              {isLoading ? (
                <div className="w-full h-96 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
              ) : aboutData?.image ? (
                <img
                  src={aboutData.image}
                  alt={isRTL ? aboutData.titleAr : aboutData.titleEn}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              ) : null}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              {isRTL ? "ما يميزنا" : "What Makes Us Special"}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 animate-pulse"></div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto mb-3 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mx-auto animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : aboutData?.features ? (
                aboutData.features.map((feature: Feature, index: number) => {
                  const IconComponent = getIcon(feature.icon);
                  return (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-3">
                          {isRTL ? feature.titleAr : feature.titleEn}
                        </h3>
                        <p className="text-muted-foreground">
                          {isRTL ? feature.descAr : feature.descEn}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              ) : null}
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center">
            {isLoading ? (
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mx-auto animate-pulse"></div>
                <div className="space-y-3 max-w-4xl mx-auto">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5 mx-auto animate-pulse"></div>
                </div>
              </div>
            ) : aboutData ? (
              <>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  {isRTL ? "مهمتنا" : "Our Mission"}
                </h2>
                <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  {isRTL ? aboutData.missionAr : aboutData.missionEn}
                </p>
              </>
            ) : null}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}