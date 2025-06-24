import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
// Logo assets served from public directory with cache busting
const englishDarkLogoImg = "/assets/english-dark_1750523791780.png?v=" + Date.now();
const englishWhiteLogoImg = "/assets/english-white_1750523827323.png?v=" + Date.now();

export function LogoSection() {
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [, setLocation] = useLocation();

  // Select the appropriate logo based on theme (always English for both languages)
  const getLogo = () => {
    return theme === 'dark' ? englishDarkLogoImg : englishWhiteLogoImg;
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

  // Individual slogan typing animation state
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentSlogan = currentSlogans[currentSloganIndex];
    
    if (!currentSlogan) return;
    
    const timeout = setTimeout(() => {
      if (isTyping && !isPaused) {
        if (charIndex < currentSlogan.length) {
          setDisplayedText(currentSlogan.slice(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
        } else {
          // Finished typing, start pause
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsTyping(false);
          }, 2500);
        }
      } else if (!isTyping && !isPaused) {
        // Clear and move to next slogan
        setDisplayedText('');
        setCharIndex(0);
        setCurrentSloganIndex(prev => (prev + 1) % currentSlogans.length);
        setIsTyping(true);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isTyping, isPaused, currentSloganIndex, currentSlogans]);

  // Reset animation when language changes
  useEffect(() => {
    setCurrentSloganIndex(0);
    setDisplayedText('');
    setCharIndex(0);
    setIsTyping(true);
    setIsPaused(false);
  }, [language]);

  return (
    <div className="relative py-16 md:py-24 overflow-hidden">
      {/* Enhanced background with drinks, hookah, and food */}
      <div className="absolute inset-0 z-0">
        {/* Left side - Coffee and drinks */}
        <div className="absolute left-0 top-0 w-1/3 h-full">
          <img 
            src="https://picsum.photos/600/800?random=1&coffee"
            alt="Premium coffee and drinks"
            className="w-full h-full object-cover opacity-40 dark:opacity-30 animate-pulse"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/600x800/D2691E/FFFFFF?text=Coffee+%26+Drinks";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/80 dark:to-gray-800/80"></div>
        </div>
        
        {/* Center - Hookah and atmosphere */}
        <div className="absolute left-1/3 top-0 w-1/3 h-full">
          <img 
            src="https://picsum.photos/600/800?random=2&lounge"
            alt="Hookah lounge atmosphere"
            className="w-full h-full object-cover opacity-35 dark:opacity-25 animate-pulse"
            style={{ animationDelay: '2s' }}
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/600x800/4B0082/FFFFFF?text=Hookah+Lounge";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/60 to-white/70 dark:from-gray-800/70 dark:via-gray-800/60 dark:to-gray-800/70"></div>
        </div>
        
        {/* Right side - Food and desserts */}
        <div className="absolute right-0 top-0 w-1/3 h-full">
          <img 
            src="https://picsum.photos/600/800?random=3&food"
            alt="Delicious food and desserts"
            className="w-full h-full object-cover opacity-40 dark:opacity-30 animate-pulse"
            style={{ animationDelay: '4s' }}
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/600x800/FF8C00/FFFFFF?text=Food+%26+Desserts";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/80 dark:to-gray-800/80"></div>
        </div>
        
        {/* Central fade overlay for content readability */}
        <div className="absolute inset-0 bg-gradient-radial from-white/90 via-white/70 to-transparent dark:from-gray-900/90 dark:via-gray-800/70 dark:to-transparent"></div>
        
        {/* Center radial gradient for natural blending */}
        <div className="absolute inset-0 bg-radial-gradient from-white/50 via-white/20 to-transparent dark:from-gray-800/50 dark:via-gray-800/20 dark:to-transparent"></div>
      </div>
      {/* Main Logo */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="animate-bounce-slow mb-8">
          <img 
            src={getLogo()} 
            alt={isRTL ? "ليت لاونج" : "LateLounge"}
            className="h-32 md:h-48 lg:h-56 mx-auto object-contain filter drop-shadow-2xl"

          />
        </div>
        
        {/* Typing Animation Slogans */}
        <div className="py-6 min-h-[80px] flex items-center justify-center">
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