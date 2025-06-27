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
    <section className="relative min-h-screen bg-gradient-to-br from-purple-900/90 via-gray-800/80 to-orange-800/90 overflow-hidden">
      {/* Seamless Video Color Integration */}
      <div className="absolute inset-0">
        {/* Extended video color palette across background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-800/40 via-gray-900/60 to-orange-700/40"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-orange-600/20 via-purple-600/15 to-gray-800/30"></div>
        {/* Subtle atmospheric effects */}
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-gradient-radial from-orange-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[400px] bg-gradient-radial from-purple-400/10 via-transparent to-transparent rounded-full blur-2xl"></div>
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
              
              {/* Subtle Video Integration Effects */}
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-500/10 via-gray-600/5 to-orange-500/10 rounded-3xl blur-2xl"></div>
              <div className="absolute -inset-3 bg-gradient-to-r from-purple-400/5 via-transparent to-orange-400/5 rounded-2xl blur-xl"></div>
            </div>
          </div>

          {/* Big Arabic/English Text - Right Side (Left in RTL) */}
          <div className={`relative ${isRTL ? 'lg:order-1' : 'lg:order-2'} flex flex-col justify-center ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="space-y-8">
              {/* Main Slogan */}
              <div className="space-y-3">
                <h1 className={`text-4xl lg:text-6xl font-bold leading-tight text-white ${isRTL ? 'font-arabic' : ''}`}>
                  <span className="block">
                    {isRTL ? "معنا" : "WITH US"}
                  </span>
                  <span className="block">
                    {isRTL ? "حماية" : "PROTECTION"}
                  </span>
                  <span className="block">
                    {isRTL ? "سيارتك" : "GUARANTEED"}
                  </span>
                  <span className="block">
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