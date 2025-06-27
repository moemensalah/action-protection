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
    <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-orange-500/10 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-500/10 rounded-full animate-ping"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Text Content */}
          <div className={`space-y-8 ${isRTL ? 'lg:order-2 text-right' : 'lg:order-1 text-left'}`}>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                <span className="block text-blue-400">
                  {isRTL ? "أكشن" : "ACTION"}
                </span>
                <span className="block text-orange-400">
                  {isRTL ? "بروتكشن" : "PROTECTION"}
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 max-w-lg">
                {isRTL 
                  ? "خدمات حماية مركبات متقدمة مع الخبرة الكويتية الأصيلة"
                  : "Advanced Vehicle Protection Services with Authentic Kuwaiti Expertise"
                }
              </p>
              
              <p className="text-lg text-gray-400 max-w-md">
                {isRTL
                  ? "نقدم أفضل خدمات العزل الحراري وحماية الطلاء والتلميع الاحترافي لمركبتك الفاخرة"
                  : "We provide the finest thermal insulation, paint protection, and professional polishing for your luxury vehicle"
                }
              </p>
            </div>

            {/* Animated Logo */}
            <div className="relative">
              <div 
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-orange-600 p-4 rounded-2xl shadow-2xl transform"
                style={{ 
                  transform: `rotate(${logoPosition * 0.5}deg) scale(${1 + Math.sin(logoPosition * 0.1) * 0.1})` 
                }}
              >
                <Shield className="w-8 h-8 text-white animate-pulse" />
                <span className="text-white font-bold text-xl">ACTION PROTECTION</span>
                <Car className="w-8 h-8 text-white animate-bounce" />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {isRTL ? "اكتشف خدماتنا" : "Discover Our Services"}
                {isRTL ? <ArrowLeft className="ml-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {isRTL ? "تواصل معنا" : "Contact Us"}
              </Button>
            </div>
          </div>

          {/* Kuwaiti Man with Car Image */}
          <div className={`relative ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="relative">
              {/* Car Background with Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent rounded-3xl"></div>
              
              {/* Main Image Container */}
              <div className="relative bg-gradient-to-br from-blue-800/20 to-orange-800/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                
                {/* Kuwaiti Man Illustration */}
                <div className="relative mb-6">
                  <div className="w-64 h-80 mx-auto bg-gradient-to-b from-white/10 to-white/5 rounded-2xl flex items-end justify-center p-6 backdrop-blur-sm">
                    {/* Kuwaiti Traditional Dress Figure */}
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mx-auto mb-4 shadow-xl"></div>
                      <div className="w-32 h-40 bg-gradient-to-b from-white to-gray-100 rounded-t-full mx-auto shadow-xl relative">
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gold bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
                      </div>
                      <div className="mt-2 text-white font-bold text-lg">
                        {isRTL ? "خبير كويتي" : "Kuwaiti Expert"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Luxury Car Silhouette */}
                <div className="relative">
                  <div className="w-full h-32 bg-gradient-to-r from-gray-800 to-gray-600 rounded-xl shadow-2xl relative overflow-hidden">
                    {/* Car Shape */}
                    <div className="absolute inset-2 bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg"></div>
                    <div className="absolute top-4 left-4 right-4 h-8 bg-gradient-to-r from-gray-300 to-gray-100 rounded opacity-20"></div>
                    
                    {/* Wheels */}
                    <div className="absolute bottom-2 left-8 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-600"></div>
                    <div className="absolute bottom-2 right-8 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-600"></div>
                  </div>
                  
                  {/* Car Brand Badge */}
                  <div className="absolute -top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
                    {isRTL ? "سيارة فاخرة" : "Luxury Vehicle"}
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-8 right-8 w-12 h-12 bg-blue-500/30 rounded-full animate-ping"></div>
                <div className="absolute bottom-8 left-8 w-8 h-8 bg-orange-500/30 rounded-full animate-pulse"></div>
              </div>
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