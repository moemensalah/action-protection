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
    <section className="relative min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-orange-900 overflow-hidden">
      {/* Video Background Effects */}
      <div className="absolute inset-0">
        {/* Purple-orange ambient lighting to match video */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/20 via-transparent to-orange-600/20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-orange-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-radial from-purple-400/20 via-transparent to-transparent rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full ${isRTL ? 'lg:grid-flow-col-dense' : ''}`}>
          
          {/* Cinematic G-Class Video - Left Side (Right in RTL) */}
          <div className={`relative ${isRTL ? 'lg:order-2' : 'lg:order-1'} flex justify-center`}>
            <div className="relative">
              {/* Video Container */}
              <div className="w-full max-w-2xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-cover rounded-2xl shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 0 40px rgba(147, 51, 234, 0.4))'
                  }}
                >
                  <source src="/assets/g-class-hero-video.mp4" type="video/mp4" />
                  {/* Fallback image if video fails */}
                  <img
                    src="/assets/g-class-hero.png"
                    alt={isRTL ? "مرسيدس جي كلاس" : "Mercedes G-Class"}
                    className="w-full h-auto object-contain rounded-2xl"
                  />
                </video>
              </div>
              
              {/* Enhanced Video Glow Effects */}
              <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-orange-500/30 rounded-3xl blur-3xl animate-pulse"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/15 via-transparent to-orange-400/15 rounded-2xl blur-2xl"></div>
            </div>
          </div>

          {/* Big Arabic/English Text - Right Side (Left in RTL) */}
          <div className={`relative ${isRTL ? 'lg:order-1' : 'lg:order-2'} flex flex-col justify-center ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="space-y-8">
              {/* Main Slogan */}
              <div className="space-y-4">
                <h1 className={`text-6xl lg:text-8xl font-bold leading-tight ${isRTL ? 'font-arabic' : ''}`}>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 animate-pulse">
                    {isRTL ? "معنا" : "WITH US"}
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400">
                    {isRTL ? "حماية" : "PROTECTION"}
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    {isRTL ? "سيارتك" : "GUARANTEED"}
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400">
                    {isRTL ? "مضمونة" : "FOR YOUR CAR"}
                  </span>
                </h1>
              </div>
              
              {/* Company Name */}
              <div className="space-y-2">
                <div className={`text-3xl lg:text-5xl font-bold text-white ${isRTL ? 'font-arabic' : ''}`}>
                  <span className="text-blue-400">
                    {isRTL ? "أكشن" : "ACTION"}
                  </span>
                  {" "}
                  <span className="text-orange-400">
                    {isRTL ? "بروتكشن" : "PROTECTION"}
                  </span>
                </div>
                <p className={`text-xl lg:text-2xl text-gray-300 max-w-lg ${isRTL ? 'font-arabic mr-0' : 'ml-0'}`}>
                  {isRTL 
                    ? "الخبرة الكويتية في حماية وعناية المركبات الفاخرة"
                    : "Kuwaiti Expertise in Luxury Vehicle Protection & Care"
                  }
                </p>
              </div>

              {/* CTA Buttons */}
              <div className={`flex flex-col sm:flex-row gap-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white px-10 py-5 text-xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  {isRTL ? "احجز موعد" : "Book Appointment"}
                  {isRTL ? <ArrowLeft className="mr-3 w-6 h-6" /> : <ArrowRight className="ml-3 w-6 h-6" />}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-3 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black px-10 py-5 text-xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                >
                  {isRTL ? "اتصل بنا" : "Call Us"}
                </Button>
              </div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -z-10 top-10 right-10 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-bounce"></div>
            <div className="absolute -z-10 bottom-20 left-10 w-16 h-16 bg-orange-500/20 rounded-full blur-lg animate-pulse"></div>
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