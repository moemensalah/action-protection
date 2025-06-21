import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import englishDarkLogo from "@assets/english-dark_1750516197108.png";
import arabicDarkLogo from "@assets/arabic-dark_1750516197109.png";
import englishWhiteLogo from "@assets/english-white_1750516260876.png";
import arabicWhiteLogo from "@assets/arabic-white_1750516260877.png";
import englishDarkModeLogo from "@assets/english-dark_1750516613230.png";
import arabicDarkModelogo from "@assets/arabic-dark_1750516613229.png";

export function LogoSection() {
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [, setLocation] = useLocation();

  // Select the appropriate logo based on language and theme
  const getLogo = () => {
    if (language === 'ar') {
      return theme === 'dark' ? arabicDarkModelogo : arabicDarkLogo;
    } else {
      return theme === 'dark' ? englishDarkModeLogo : englishDarkLogo;
    }
  };

  // Marquee slogans in both languages
  const slogans = {
    en: [
      "Premium Coffee Experience",
      "Artisan Beverages & Delights",
      "Where Quality Meets Comfort",
      "Fresh Roasted Daily",
      "Your Perfect Coffee Destination",
      "Exceptional Taste, Every Time"
    ],
    ar: [
      "تجربة قهوة مميزة",
      "مشروبات وحلويات حرفية",
      "حيث تلتقي الجودة بالراحة",
      "محمصة طازجة يومياً",
      "وجهتك المثالية للقهوة",
      "طعم استثنائي في كل مرة"
    ]
  };

  const currentSlogans = slogans[language];

  return (
    <div className="relative py-16 md:py-24 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-900/20">
      {/* Main Logo */}
      <div className="container mx-auto px-4 text-center">
        <div className="animate-bounce-slow mb-8">
          <img 
            src={getLogo()} 
            alt="Lounge Logo"
            className="h-32 md:h-48 lg:h-56 mx-auto object-contain filter drop-shadow-2xl"

          />
        </div>
        
        {/* Animated Marquee Slogans */}
        <div className="overflow-hidden bg-gradient-to-r from-amber-100 to-orange-100 dark:from-gray-800 dark:to-amber-900/30 rounded-full py-4 shadow-lg">
          <div className="marquee-container">
            <div className="marquee-content">
              {currentSlogans.map((slogan, index) => (
                <span 
                  key={index}
                  className="inline-block mx-8 text-lg md:text-xl font-semibold text-amber-800 dark:text-amber-200 whitespace-nowrap"
                >
                  {slogan}
                  <span className="mx-4 text-amber-600 dark:text-amber-400">•</span>
                </span>
              ))}
              {/* Duplicate for seamless loop */}
              {currentSlogans.map((slogan, index) => (
                <span 
                  key={`duplicate-${index}`}
                  className="inline-block mx-8 text-lg md:text-xl font-semibold text-amber-800 dark:text-amber-200 whitespace-nowrap"
                >
                  {slogan}
                  <span className="mx-4 text-amber-600 dark:text-amber-400">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Button */}
        <div className="mt-12">
          <Button
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            onClick={() => setLocation("/menu")}
          >
            {t("exploreMenu")}
            <ArrowRight className={`h-5 w-5 ml-2 ${isRTL ? 'rotate-180 mr-2 ml-0' : ''}`} />
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center space-x-4">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-150"></div>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    </div>
  );
}