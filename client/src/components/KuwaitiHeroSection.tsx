import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Shield, Car } from "lucide-react";
import { useState, useEffect } from "react";

export function KuwaitiHeroSection() {
  const { t, isRTL } = useLanguage();
  const [typedText, setTypedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const words = isRTL 
    ? ["حماية سيارتك مضمونة", "سلمنا المفتاح وسيب الباقي علينا", "أقوى مركز لحماية سيارتك في الكويت"]
    : ["YOUR CAR PROTECTION GUARANTEED", "GIVE US THE KEY AND LEAVE THE REST TO US", "STRONGEST CAR PROTECTION CENTER IN KUWAIT"];

  const backgrounds = [
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
        
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20"></div>
      </div>

      {/* Typing Text Overlay - Positioned Absolutely on Left */}
      <div className={`absolute top-1/2 left-8 lg:left-16 transform -translate-y-1/2 z-20`}>
        <div className="space-y-8">
          {/* Static Company Name */}
          <div className="space-y-3">
            <div className={`text-2xl lg:text-4xl font-bold text-white drop-shadow-xl ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
              <span className="text-orange-400">
                {isRTL ? "مع أكشن" : "WITH ACTION"}
              </span>
              {" "}
              <span className="text-blue-400">
                {isRTL ? "بروتكشن" : "PROTECTION"}
              </span>
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
              className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
            >
              {isRTL ? "اطلب الآن" : "Order Now"}
              {isRTL ? <ArrowLeft className="mr-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
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