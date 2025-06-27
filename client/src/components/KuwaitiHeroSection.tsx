import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Shield, Car } from "lucide-react";
import { useState, useEffect } from "react";

export function KuwaitiHeroSection() {
  const { t, isRTL } = useLanguage();
  const [logoPosition, setLogoPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoPosition(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Full Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onEnded={() => {
            // Video will stop after playing once
          }}
        >
          <source src="/assets/g-class-background-video.mp4" type="video/mp4" />
          {/* Fallback gradient background if video fails */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        </video>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
        <div className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Main Slogan */}
            <div className="space-y-4">
              <h1 className={`text-5xl lg:text-7xl font-bold leading-tight text-white drop-shadow-2xl ${isRTL ? 'font-arabic' : ''}`}>
                <span className="block">
                  {isRTL ? "معنا" : "WITH US"}
                </span>
                <span className="block">
                  {isRTL ? "حماية" : "PROTECTION"}
                </span>
                <span className="block">
                  {isRTL ? "سيارتك" : "GUARANTEED"}
                </span>
                <span className="block text-blue-400">
                  {isRTL ? "مضمونة" : "FOR YOUR CAR"}
                </span>
              </h1>
            </div>
            
            {/* Company Name */}
            <div className="space-y-4">
              <div className={`text-4xl lg:text-6xl font-bold text-white drop-shadow-xl ${isRTL ? 'font-arabic' : ''}`}>
                <span className="text-orange-400">
                  {isRTL ? "أكشن" : "ACTION"}
                </span>
                {" "}
                <span className="text-blue-400">
                  {isRTL ? "بروتكشن" : "PROTECTION"}
                </span>
              </div>
              <p className={`text-xl lg:text-3xl text-gray-200 max-w-3xl mx-auto drop-shadow-lg ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL 
                  ? "الخبرة الكويتية في حماية وعناية المركبات الفاخرة"
                  : "Kuwaiti Expertise in Luxury Vehicle Protection & Care"
                }
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-6 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
              >
                {isRTL ? "احجز موعد" : "Book Appointment"}
                {isRTL ? <ArrowLeft className="mr-3 w-6 h-6" /> : <ArrowRight className="ml-3 w-6 h-6" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-3 border-white text-white hover:bg-white hover:text-black px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
              >
                {isRTL ? "اتصل بنا" : "Call Us"}
              </Button>
            </div>
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