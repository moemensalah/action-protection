import { useLanguage } from "@/hooks/useLanguage";

export function VideoShowcaseSection() {
  const { isRTL } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4">
        {/* Video Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Decorative frame */}
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-blue-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
          
          <div className="relative bg-black/50 rounded-xl overflow-hidden shadow-2xl">
            <video
              className="w-full h-auto max-h-[70vh] object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls={false}
            >
              <source src="/assets/rolls-royce-video.mp4" type="video/mp4" />
              {isRTL 
                ? "متصفحك لا يدعم تشغيل الفيديو"
                : "Your browser does not support the video tag."
              }
            </video>
            
            {/* Video overlay with brand text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className={`text-2xl md:text-3xl font-bold text-white mb-2 ${
                  isRTL ? 'font-arabic text-right' : 'text-left'
                }`}>
                  {isRTL ? "رولز رويس - قمة الرفاهية" : "ROLLS ROYCE - PINNACLE OF LUXURY"}
                </h3>
                <p className={`text-gray-200 text-lg ${
                  isRTL ? 'font-arabic text-right' : 'text-left'
                }`}>
                  {isRTL 
                    ? "حماية متقدمة للسيارات الفاخرة بأعلى معايير الجودة"
                    : "Advanced protection for luxury vehicles with the highest quality standards"
                  }
                </p>
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