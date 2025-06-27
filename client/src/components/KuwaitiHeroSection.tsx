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

  const words = isRTL 
    ? ["معنا", "حماية", "سيارتك", "مضمونة"]
    : ["WITH US", "PROTECTION", "GUARANTEED", "FOR YOUR CAR"];

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
      {/* Full Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/assets/g-class-cinematic-bg.png"
          alt="Mercedes G-Class Cinematic Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20"></div>
      </div>

      {/* Typing Text Overlay - Positioned Absolutely on Left */}
      <div className={`absolute top-1/2 ${isRTL ? 'right-8 lg:right-16' : 'left-8 lg:left-16'} transform -translate-y-1/2 z-20`}>
        <div className="space-y-6">
          {/* Typing Animation Text */}
          <div className="space-y-2">
            <h1 className={`text-4xl lg:text-6xl font-bold text-white drop-shadow-2xl ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
              <span className="block min-h-[1.2em]">
                {typedText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>
          </div>
          
          {/* Company Name */}
          <div className="space-y-3">
            <div className={`text-2xl lg:text-4xl font-bold text-white drop-shadow-xl ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
              <span className="text-orange-400">
                {isRTL ? "أكشن" : "ACTION"}
              </span>
              {" "}
              <span className="text-blue-400">
                {isRTL ? "بروتكشن" : "PROTECTION"}
              </span>
            </div>
            <p className={`text-base lg:text-xl text-gray-200 max-w-md drop-shadow-lg ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
              {isRTL 
                ? "الخبرة الكويتية في حماية وعناية المركبات الفاخرة"
                : "Kuwaiti Expertise in Luxury Vehicle Protection & Care"
              }
            </p>
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col gap-4 ${isRTL ? 'items-end' : 'items-start'}`}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
            >
              {isRTL ? "احجز موعد" : "Book Appointment"}
              {isRTL ? <ArrowLeft className="mr-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
            >
              {isRTL ? "اتصل بنا" : "Call Us"}
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