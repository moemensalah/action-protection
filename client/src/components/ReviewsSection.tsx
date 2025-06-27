import { useLanguage } from "@/hooks/useLanguage";
import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

const reviews = [
  {
    id: 1,
    nameEn: "Ahmed Al-Rashid",
    nameAr: "أحمد الراشد",
    rating: 5,
    reviewEn: "Exceptional service! The ceramic coating on my Mercedes looks amazing and the thermal protection is working perfectly. Highly recommend Action Protection for premium car care.",
    reviewAr: "خدمة استثنائية! الطلاء السيراميكي على مرسيدسي يبدو رائعاً والحماية الحرارية تعمل بشكل مثالي. أنصح بشدة بأكشن بروتكشن للعناية الفاخرة بالسيارات.",
    carModel: "Mercedes S-Class",
    service: "Ceramic Coating + Thermal Protection"
  },
  {
    id: 2,
    nameEn: "Sarah Al-Mansouri",
    nameAr: "سارة المنصوري",
    rating: 5,
    reviewEn: "Outstanding paint protection film installation. My BMW X7 looks brand new even after months of use. The team is professional and the quality is top-notch.",
    reviewAr: "تركيب فيلم حماية الطلاء ممتاز. بي إم دبليو X7 تبدو جديدة حتى بعد شهور من الاستخدام. الفريق محترف والجودة من الدرجة الأولى.",
    carModel: "BMW X7",
    service: "Paint Protection Film"
  },
  {
    id: 3,
    nameEn: "Mohammed Al-Otaibi",
    nameAr: "محمد العتيبي",
    rating: 5,
    reviewEn: "Amazing polishing service! My Lexus LX570 shines like never before. The attention to detail and customer service exceeded my expectations completely.",
    reviewAr: "خدمة تلميع مذهلة! لكزس LX570 تلمع كما لم تلمع من قبل. الاهتمام بالتفاصيل وخدمة العملاء فاقت توقعاتي تماماً.",
    carModel: "Lexus LX570",
    service: "Premium Polish & Detailing"
  },
  {
    id: 4,
    nameEn: "Fatima Al-Zahra",
    nameAr: "فاطمة الزهراء",
    rating: 5,
    reviewEn: "Complete vehicle protection package was worth every riyal. My Porsche Cayenne is fully protected and looks stunning. Professional work from start to finish.",
    reviewAr: "حزمة حماية المركبة الكاملة تستحق كل ريال. بورش كايين محمية بالكامل وتبدو مذهلة. عمل احترافي من البداية للنهاية.",
    carModel: "Porsche Cayenne",
    service: "Complete Protection Package"
  },
  {
    id: 5,
    nameEn: "Khalid Al-Harbi",
    nameAr: "خالد الحربي",
    rating: 5,
    reviewEn: "The thermal insulation service for my Range Rover is incredible. Significant temperature reduction inside the car. Highly satisfied with Action Protection's expertise.",
    reviewAr: "خدمة العزل الحراري لرانج روفر رائعة. انخفاض كبير في درجة الحرارة داخل السيارة. راضٍ جداً عن خبرة أكشن بروتكشن.",
    carModel: "Range Rover Sport",
    service: "Thermal Insulation"
  },
  {
    id: 6,
    nameEn: "Nora Al-Dosari",
    nameAr: "نورا الدوسري",
    rating: 5,
    reviewEn: "Engine bay cleaning and protection service was thorough and professional. My Audi Q8 runs smoother and looks pristine under the hood. Excellent work!",
    reviewAr: "خدمة تنظيف وحماية حجرة المحرك كانت شاملة واحترافية. أودي Q8 تعمل بسلاسة أكبر وتبدو نظيفة تحت الغطاء. عمل ممتاز!",
    carModel: "Audi Q8",
    service: "Engine Bay Protection"
  }
];

export function ReviewsSection() {
  const { t, isRTL, language } = useLanguage();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {isRTL ? "آراء عملائنا" : "Customer Reviews"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? "اكتشف تجارب عملائنا مع خدمات الحماية المتقدمة لمركباتهم الفاخرة"
              : "Discover our customers' experiences with advanced protection services for their luxury vehicles"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 border-none shadow-lg">
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-orange-400 opacity-20" />
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-lg text-foreground">
                      {language === "ar" ? review.nameAr : review.nameEn}
                    </h4>
                    <div className="flex space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">{review.carModel}</span>
                    <span className="mx-2">•</span>
                    <span>{review.service}</span>
                  </div>
                </div>

                <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{language === "ar" ? review.reviewAr : review.reviewEn}"
                </blockquote>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                      {isRTL ? "عميل معتمد" : "Verified Customer"}
                    </span>
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {(language === "ar" ? review.nameAr : review.nameEn).charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg">
            <div className="flex space-x-1">
              {renderStars(5)}
            </div>
            <span className="text-lg font-bold text-foreground">5.0</span>
            <span className="text-muted-foreground">
              {isRTL ? "من 150+ تقييم" : "from 150+ reviews"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}