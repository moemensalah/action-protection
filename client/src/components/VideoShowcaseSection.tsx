import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";

export function VideoShowcaseSection() {
  const { isRTL } = useLanguage();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showText, setShowText] = useState(false);

  const videos = [
    "/assets/rolls-royce-video.mp4",
    "/assets/g-class-video.mp4"
  ];

  const textMessages = [
    { ar: "سيارتك متميزة معانا", en: "YOUR CAR IS SPECIAL WITH US" },
    { ar: "حماية فائقة للسيارات الفاخرة", en: "SUPERIOR PROTECTION FOR LUXURY CARS" }
  ];

  // Auto-rotate videos with text transitions
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const cycle = () => {
      // Show video for 8 seconds
      setShowText(false);
      
      timeoutId = setTimeout(() => {
        // Show text for 3 seconds
        setShowText(true);
        
        timeoutId = setTimeout(() => {
          // Switch to next video while text is still showing
          setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
          
          // Small delay to ensure video loads, then hide text
          timeoutId = setTimeout(() => {
            cycle(); // Restart cycle
          }, 100);
        }, 3000);
      }, 8000);
    };
    
    cycle(); // Start the cycle
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [videos.length]);

  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 ${
            isRTL ? 'font-arabic' : ''
          }`}>
            {isRTL ? "تجربة الرفاهية الحقيقية" : "EXPERIENCE TRUE LUXURY"}
          </h2>
          <p className={`text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed ${
            isRTL ? 'font-arabic' : ''
          }`}>
            {isRTL 
              ? "اكتشف مستوى جديد من الحماية والأناقة مع خدماتنا المتخصصة للسيارات الفاخرة"
              : "Discover a new level of protection and elegance with our specialized luxury vehicle services"
            }
          </p>
        </div>

        {/* Video Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Decorative frame */}
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-blue-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
          
          <div className="relative bg-black/50 rounded-xl overflow-hidden shadow-2xl">
            {/* Videos */}
            {videos.map((video, index) => (
              <video
                key={video}
                className={`w-full h-auto max-h-[70vh] object-cover transition-opacity duration-500 ${
                  index === currentVideoIndex && !showText ? 'opacity-100' : 'opacity-0'
                } ${index !== currentVideoIndex ? 'absolute inset-0' : ''}`}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
              >
                <source src={video} type="video/mp4" />
                {isRTL 
                  ? "متصفحك لا يدعم تشغيل الفيديو"
                  : "Your browser does not support the video tag."
                }
              </video>
            ))}

            {/* Text Transition */}
            <div className={`absolute inset-0 bg-black flex items-center justify-center transition-opacity duration-500 ${
              showText ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
              <div className="text-center px-8">
                <h3 className={`text-4xl md:text-6xl font-bold text-white mb-4 ${
                  isRTL ? 'font-arabic' : ''
                } animate-pulse`}>
                  {isRTL ? textMessages[currentVideoIndex]?.ar : textMessages[currentVideoIndex]?.en}
                </h3>
                
                {/* Decorative elements */}
                <div className="flex justify-center items-center space-x-4 rtl:space-x-reverse">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-orange-500"></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-blue-500"></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className={`inline-flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              {isRTL ? "احجز موعدك الآن" : "Book Your Appointment"}
            </button>
            <button className="px-8 py-4 border-2 border-blue-500 text-blue-400 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300">
              {isRTL ? "استكشف خدماتنا" : "Explore Our Services"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}