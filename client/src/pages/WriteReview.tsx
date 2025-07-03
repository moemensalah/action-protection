import { WriteReview as WriteReviewComponent } from "@/components/customer/WriteReview";
import { useLanguage } from "@/hooks/useLanguage";

export default function WriteReview() {
  const { isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRTL ? "كتابة تقييم" : "Write a Review"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isRTL 
              ? "شارك تجربتك مع خدماتنا وساعد العملاء الآخرين" 
              : "Share your experience with our services and help other customers"
            }
          </p>
        </div>
        <WriteReviewComponent />
      </div>
    </div>
  );
}