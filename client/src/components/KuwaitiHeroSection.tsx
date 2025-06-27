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
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* Corner Light Effects */}
      <div className="absolute inset-0">
        {/* Top-left corner light */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-blue-400/30 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
        {/* Bottom-right corner light */}
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-radial from-orange-400/20 via-orange-500/10 to-transparent rounded-full blur-3xl"></div>
        {/* Additional ambient light */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-radial from-white/5 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center w-full">
          
          {/* Modern Car - Left Side */}
          <div className="relative lg:order-1">
            <div className="relative">
              {/* Modern Car SVG */}
              <div className="w-full max-w-md mx-auto">
                <svg viewBox="0 0 400 200" className="w-full h-auto">
                  {/* Car Body */}
                  <defs>
                    <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Main car body */}
                  <path d="M50 120 Q50 100 80 100 L320 100 Q350 100 350 120 L350 140 Q350 160 320 160 L80 160 Q50 160 50 140 Z" 
                        fill="url(#carGradient)" filter="url(#glow)" />
                  
                  {/* Car roof */}
                  <path d="M90 100 Q90 80 120 80 L280 80 Q310 80 310 100 L290 100 L110 100 Z" 
                        fill="#1e3a8a" opacity="0.8" />
                  
                  {/* Windows */}
                  <rect x="100" y="85" width="200" height="15" rx="5" fill="#60a5fa" opacity="0.3" />
                  
                  {/* Wheels */}
                  <circle cx="120" cy="150" r="20" fill="#374151" stroke="#6b7280" strokeWidth="2" />
                  <circle cx="280" cy="150" r="20" fill="#374151" stroke="#6b7280" strokeWidth="2" />
                  <circle cx="120" cy="150" r="12" fill="#1f2937" />
                  <circle cx="280" cy="150" r="12" fill="#1f2937" />
                  
                  {/* Headlights */}
                  <ellipse cx="340" cy="125" rx="8" ry="12" fill="#fbbf24" opacity="0.8" />
                  <ellipse cx="340" cy="135" rx="8" ry="8" fill="#f59e0b" />
                  
                  {/* Side details */}
                  <line x1="100" y1="130" x2="300" y2="130" stroke="#60a5fa" strokeWidth="2" opacity="0.5" />
                </svg>
              </div>
              
              {/* Car glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent rounded-full blur-xl"></div>
            </div>
          </div>

          {/* Center Content */}
          <div className="space-y-8 text-center lg:order-2">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                <span className="block text-blue-400">
                  {isRTL ? "أكشن" : "ACTION"}
                </span>
                <span className="block text-orange-400">
                  {isRTL ? "بروتكشن" : "PROTECTION"}
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 max-w-lg mx-auto">
                {isRTL 
                  ? "خدمات حماية مركبات متقدمة"
                  : "Advanced Vehicle Protection Services"
                }
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

          {/* Animated Logo - Right Side */}
          <div className="relative lg:order-3 flex justify-center">
            <div className="relative">
              <div 
                className="inline-flex items-center justify-center w-64 h-64 bg-gradient-to-br from-blue-600/20 to-orange-600/20 rounded-full backdrop-blur-sm border border-white/10 transform"
                style={{ 
                  transform: `rotate(${logoPosition * 0.3}deg) scale(${1 + Math.sin(logoPosition * 0.05) * 0.1})` 
                }}
              >
                {/* Animated Logo Content */}
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Shield 
                      className="w-16 h-16 text-blue-400 mx-auto animate-pulse" 
                      style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' }}
                    />
                    <Car 
                      className="w-12 h-12 text-orange-400 absolute -bottom-2 -right-2 animate-bounce"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.5))' }}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-white font-bold text-xl tracking-wider">ACTION</div>
                    <div className="text-orange-400 font-bold text-xl tracking-wider">PROTECTION</div>
                  </div>
                </div>
              </div>
              
              {/* Logo glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-orange-500/10 rounded-full blur-2xl animate-pulse"></div>
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