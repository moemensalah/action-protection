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
          
          {/* G-Class Mercedes Car - Left Side */}
          <div className="relative lg:order-1 flex justify-center">
            <div className="relative">
              {/* G-Class Mercedes SVG */}
              <div className="w-full max-w-lg">
                <svg viewBox="0 0 500 300" className="w-full h-auto">
                  <defs>
                    <linearGradient id="gClassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2c3e50" />
                      <stop offset="50%" stopColor="#34495e" />
                      <stop offset="100%" stopColor="#1a252f" />
                    </linearGradient>
                    <filter id="carGlow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#60a5fa" opacity="0.8" />
                      <stop offset="100%" stopColor="#3b82f6" opacity="0.4" />
                    </linearGradient>
                  </defs>
                  
                  {/* G-Class Body - Boxy SUV Shape */}
                  <rect x="60" y="120" width="300" height="100" rx="8" 
                        fill="url(#gClassGradient)" filter="url(#carGlow)" />
                  
                  {/* Front Section */}
                  <rect x="360" y="130" width="40" height="80" rx="5" 
                        fill="#2c3e50" />
                  
                  {/* Rear Section */}
                  <rect x="40" y="130" width="20" height="80" rx="5" 
                        fill="#2c3e50" />
                  
                  {/* Windows */}
                  <rect x="80" y="100" width="60" height="25" rx="3" 
                        fill="#60a5fa" opacity="0.3" />
                  <rect x="160" y="100" width="80" height="25" rx="3" 
                        fill="#60a5fa" opacity="0.3" />
                  <rect x="260" y="100" width="80" height="25" rx="3" 
                        fill="#60a5fa" opacity="0.3" />
                  
                  {/* Wheels - Large SUV wheels */}
                  <circle cx="120" cy="230" r="25" fill="#1f2937" stroke="#374151" strokeWidth="3" />
                  <circle cx="320" cy="230" r="25" fill="#1f2937" stroke="#374151" strokeWidth="3" />
                  <circle cx="120" cy="230" r="15" fill="#111827" />
                  <circle cx="320" cy="230" r="15" fill="#111827" />
                  
                  {/* G-Class Distinctive Grille */}
                  <rect x="370" y="140" width="25" height="40" rx="2" 
                        fill="#4b5563" stroke="#6b7280" strokeWidth="1" />
                  <line x1="375" y1="145" x2="375" y2="175" stroke="#9ca3af" strokeWidth="1" />
                  <line x1="385" y1="145" x2="385" y2="175" stroke="#9ca3af" strokeWidth="1" />
                  
                  {/* Headlights */}
                  <ellipse cx="395" cy="150" rx="8" ry="15" fill="#fbbf24" opacity="0.9" />
                  <ellipse cx="395" cy="170" rx="8" ry="15" fill="#f59e0b" opacity="0.9" />
                  
                  {/* Side Details */}
                  <line x1="80" y1="160" x2="340" y2="160" stroke="#60a5fa" strokeWidth="2" opacity="0.6" />
                  <rect x="90" y="180" width="20" height="8" rx="2" fill="#6b7280" />
                  <rect x="130" y="180" width="20" height="8" rx="2" fill="#6b7280" />
                  
                  {/* Light Effect */}
                  <rect x="0" y="120" width="500" height="4" fill="url(#lightGradient)" opacity="0.6" />
                  <rect x="0" y="200" width="500" height="2" fill="url(#lightGradient)" opacity="0.4" />
                </svg>
              </div>
              
              {/* Enhanced Car Glow Effects */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-blue-400/20 to-transparent rounded-xl blur-2xl animate-pulse"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-white/10 to-transparent rounded-lg blur-xl"></div>
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

          {/* Smiling Car Worker - Right Side */}
          <div className="relative lg:order-3 flex justify-center">
            <div className="relative">
              {/* Car Worker Illustration */}
              <div className="w-full max-w-sm">
                <svg viewBox="0 0 300 400" className="w-full h-auto">
                  <defs>
                    <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d4a574" />
                      <stop offset="100%" stopColor="#c49464" />
                    </linearGradient>
                    <linearGradient id="uniformGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                    <filter id="workerGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Body */}
                  <ellipse cx="150" cy="280" rx="60" ry="80" fill="url(#uniformGradient)" filter="url(#workerGlow)" />
                  
                  {/* Arms */}
                  <ellipse cx="90" cy="240" rx="20" ry="50" fill="url(#uniformGradient)" transform="rotate(-20 90 240)" />
                  <ellipse cx="210" cy="240" rx="20" ry="50" fill="url(#uniformGradient)" transform="rotate(20 210 240)" />
                  
                  {/* Hands */}
                  <circle cx="75" cy="280" r="12" fill="url(#skinGradient)" />
                  <circle cx="225" cy="280" r="12" fill="url(#skinGradient)" />
                  
                  {/* Head */}
                  <circle cx="150" cy="140" r="45" fill="url(#skinGradient)" filter="url(#workerGlow)" />
                  
                  {/* Hair */}
                  <path d="M 110 110 Q 150 90 190 110 Q 185 120 150 125 Q 115 120 110 110" fill="#2d1810" />
                  
                  {/* Eyes */}
                  <ellipse cx="135" cy="130" rx="6" ry="8" fill="#1f2937" />
                  <ellipse cx="165" cy="130" rx="6" ry="8" fill="#1f2937" />
                  <circle cx="137" cy="128" r="2" fill="white" />
                  <circle cx="167" cy="128" r="2" fill="white" />
                  
                  {/* Smile */}
                  <path d="M 125 155 Q 150 170 175 155" stroke="#8b4513" strokeWidth="3" fill="none" strokeLinecap="round" />
                  
                  {/* Nose */}
                  <ellipse cx="150" cy="145" rx="3" ry="5" fill="#c49464" />
                  
                  {/* Work Badge */}
                  <rect x="130" y="220" width="40" height="20" rx="3" fill="#fbbf24" />
                  <text x="150" y="235" textAnchor="middle" fontSize="8" fill="#1f2937" fontWeight="bold">ACTION</text>
                  
                  {/* Tool in Hand */}
                  <rect x="70" y="270" width="15" height="4" rx="2" fill="#6b7280" />
                  <circle cx="68" cy="272" r="3" fill="#374151" />
                  
                  {/* Legs */}
                  <ellipse cx="130" cy="360" rx="15" ry="40" fill="#1e3a8a" />
                  <ellipse cx="170" cy="360" rx="15" ry="40" fill="#1e3a8a" />
                  
                  {/* Shoes */}
                  <ellipse cx="130" cy="390" rx="18" ry="8" fill="#1f2937" />
                  <ellipse cx="170" cy="390" rx="18" ry="8" fill="#1f2937" />
                </svg>
              </div>
              
              {/* Worker Glow Effects */}
              <div className="absolute -inset-4 bg-gradient-to-l from-orange-500/20 via-orange-400/10 to-transparent rounded-xl blur-2xl animate-pulse"></div>
              <div className="absolute -inset-2 bg-gradient-to-l from-white/5 to-transparent rounded-lg blur-lg"></div>
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