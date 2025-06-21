import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
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

  // Select the appropriate logo based on theme (always English)
  const getLogo = () => {
    return theme === 'dark' ? englishDarkModeLogo : englishDarkLogo;
  };

  // Typing slogans with multiple words
  const slogans = {
    en: [
      "Premium Coffee Experience for Coffee Lovers",
      "Artisan Beverages & Delicious Fresh Treats",
      "Where Quality Always Meets Perfect Comfort",
      "Fresh Roasted Daily with Premium Beans",
      "Your Perfect Coffee Destination Every Day",
      "Exceptional Taste Every Single Time"
    ],
    ar: [
      "تجربة قهوة مميزة لعشاق القهوة الأصيلة",
      "مشروبات حرفية وحلويات طازجة لذيذة",
      "حيث تلتقي الجودة دائماً بالراحة المثالية",
      "محمصة طازجة يومياً بحبوب مميزة",
      "وجهتك المثالية للقهوة في كل يوم",
      "طعم استثنائي في كل مرة ولحظة"
    ]
  };

  const currentSlogans = slogans[language];

  // Typing animation state
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentSlogan = currentSlogans[currentSloganIndex];
    
    if (isTyping && !isPaused) {
      if (displayedText.length < currentSlogan.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentSlogan.slice(0, displayedText.length + 1));
        }, 80); // Slightly faster typing
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, pause before erasing
        setIsPaused(true);
        const timeout = setTimeout(() => {
          setIsTyping(false);
          setIsPaused(false);
        }, 3000); // Longer pause to read
        return () => clearTimeout(timeout);
      }
    } else if (!isTyping && !isPaused) {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 40); // Faster erasing
        return () => clearTimeout(timeout);
      } else {
        // Finished erasing, move to next slogan and continue infinitely
        setCurrentSloganIndex((prev) => (prev + 1) % currentSlogans.length);
        setIsTyping(true);
      }
    }
  }, [displayedText, isTyping, isPaused, currentSlogans, currentSloganIndex]);

  // Reset animation when language changes
  useEffect(() => {
    setCurrentSloganIndex(0);
    setDisplayedText('');
    setIsTyping(true);
    setIsPaused(false);
  }, [language]);

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
        
        {/* Typing Animation Slogans */}
        <div className="bg-transparent border-2 border-amber-300 dark:border-amber-600 rounded-lg py-6 shadow-lg min-h-[80px] flex items-center justify-center backdrop-blur-sm">
          <div className="text-center px-4">
            <div className="text-lg md:text-xl font-semibold text-amber-900 dark:text-amber-100 min-h-[28px] flex items-center justify-center">
              <span className="typing-text">
                {displayedText}
                <span className="typing-cursor">|</span>
              </span>
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


      </div>
    </div>
  );
}