import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Shield, Car } from "lucide-react";
import { useState, useEffect } from "react";

export function KuwaitiHeroSection() {
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [typedText, setTypedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const words = isRTL 
    ? ["حماية سيارتك مضمونة", "سلمنا المفتاح وسيب الباقي علينا", "أقوى مركز لحماية سيارتك في الكويت"]
    : ["YOUR CAR PROTECTION GUARANTEED", "GIVE US THE KEY AND LEAVE THE REST TO US", "STRONGEST CAR PROTECTION CENTER IN KUWAIT"];

  const backgrounds = [
    "/assets/mercedes-g-class-ultra-wide.png",
    "/assets/g-class-cinematic-bg.png",
    "/assets/jeep-wrangler-bg-1.png", 
    "/assets/jeep-wrangler-bg-2.png",
    "/assets/nissan-patrol-bg.png"
  ];

  // Background rotation effect
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 8000);

    return () => clearInterval(bgInterval);
  }, [backgrounds.length]);

  // Typing animation effect
  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 1000 : 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting && currentCharIndex < currentWord.length) {
        setTypedText(currentWord.substring(0, currentCharIndex + 1));
        setCurrentCharIndex(currentCharIndex + 1);
      } else if (isDeleting && currentCharIndex > 0) {
        setTypedText(currentWord.substring(0, currentCharIndex - 1));
        setCurrentCharIndex(currentCharIndex - 1);
      } else if (!isDeleting && currentCharIndex === currentWord.length) {
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && currentCharIndex === 0) {
        setIsDeleting(false);
        setCurrentWordIndex((currentWordIndex + 1) % words.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentCharIndex, currentWordIndex, isDeleting, words]);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Rotating Background Images */}
      <div className="absolute inset-0 w-full h-full">
        {backgrounds.map((bg, index) => (
          <img
            key={bg}
            src={bg}
            alt={`Cinematic Car Background ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentBgIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        
        {/* Smoking/Dust Particle Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating particles */}
          <div className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse top-1/4 left-1/4" 
               style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
          <div className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse top-1/3 right-1/3"
               style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
          <div className="absolute w-3 h-3 bg-white/5 rounded-full animate-pulse bottom-1/3 left-1/2"
               style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute w-1 h-1 bg-white/15 rounded-full animate-pulse top-1/2 right-1/4"
               style={{ animationDelay: '3s', animationDuration: '4s' }}></div>
          <div className="absolute w-2 h-2 bg-white/8 rounded-full animate-pulse bottom-1/4 right-1/2"
               style={{ animationDelay: '4s', animationDuration: '6s' }}></div>
          
          {/* Floating smoke wisps */}
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-full blur-xl animate-pulse"
               style={{ animationDelay: '0s', animationDuration: '8s' }}></div>
          <div className="absolute bottom-0 right-1/3 w-24 h-24 bg-gradient-radial from-white/3 to-transparent rounded-full blur-2xl animate-pulse"
               style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
          <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-gradient-radial from-white/4 to-transparent rounded-full blur-xl animate-pulse"
               style={{ animationDelay: '4s', animationDuration: '7s' }}></div>
        </div>

        {/* Minimal overlay for text readability only */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Light gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent"></div>
      </div>

      {/* Typing Text Overlay - Positioned Absolutely on Left */}
      <div className={`absolute top-1/2 left-8 lg:left-16 transform -translate-y-1/2 z-20`}>
        <div className="space-y-8">
          {/* Action Protection Logo */}
          <div className="space-y-3">
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="inline-block relative">
                <div className="animate-float">
                  <img 
                    src="/assets/action-protection-logo-dark.png"
                    alt={isRTL ? "أكشن بروتكشن" : "Action Protection"}
                    className="h-16 lg:h-24 object-contain filter drop-shadow-2xl transform transition-all duration-1000 hover:scale-110"
                  />
                </div>
                
                {/* Animated glow effect behind logo */}
                <div className="absolute inset-0 -z-10">
                  <div className="h-16 lg:h-24 bg-gradient-to-r from-orange-400/20 via-orange-500/30 to-orange-400/20 blur-xl animate-pulse-glow rounded-full transform scale-150"></div>
                </div>
                
                {/* Animated particles around logo */}
                <div className="absolute inset-0 -z-5">
                  <div className="animate-float-delayed-1 absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-orange-400/70 rounded-full blur-sm"></div>
                  <div className="animate-float-delayed-2 absolute top-3/4 right-1/4 w-1 h-1 bg-orange-500/80 rounded-full blur-sm"></div>
                  <div className="animate-float-delayed-3 absolute top-1/2 left-1/6 w-1 h-1 bg-orange-300/60 rounded-full blur-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Typing Animation Text - Smaller */}
          <div className="space-y-4">
            <h2 className={`text-xl lg:text-2xl font-bold text-white drop-shadow-2xl ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
              <span className="block min-h-[1.5em]">
                {typedText}
                <span className="animate-pulse">|</span>
              </span>
            </h2>
          </div>

          {/* CTA Buttons - Side by Side */}
          <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Button 
              size="lg" 
              style={{ background: 'linear-gradient(to right, #3B82F6, hsl(30, 100%, 55%))' }}
              className="hover:opacity-90 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
            >
              {isRTL ? "اطلب الآن" : "Order Now"}
              {isRTL ? <ArrowLeft className="mr-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black px-8 py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-black/20 dark:bg-transparent"
            >
              {isRTL ? "تواصل معنا" : "Contact Us"}
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-8 border-2 border-white/50 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}