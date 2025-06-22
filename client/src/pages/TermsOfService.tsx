import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";

interface TermsOfService {
  id: number;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  lastUpdated: string;
  isActive: boolean;
}

export default function TermsOfService() {
  const { isRTL } = useLanguage();

  const { data: termsOfService, isLoading } = useQuery<TermsOfService>({
    queryKey: ["/api/terms-of-service"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!termsOfService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {isRTL ? "شروط الخدمة غير متوفرة" : "Terms of Service Not Available"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? "يرجى المحاولة مرة أخرى لاحقاً" : "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  const title = isRTL ? termsOfService.titleAr : termsOfService.titleEn;
  const content = isRTL ? termsOfService.contentAr : termsOfService.contentEn;

  return (
    <>
      <SEO
        title={`${title} | ${isRTL ? "ليت لاونج" : "LateLounge"}`}
        description={isRTL ? "شروط الخدمة لليت لاونج" : "Terms of Service for LateLounge"}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          description: isRTL ? "شروط الخدمة" : "Terms of Service",
          dateModified: termsOfService.lastUpdated,
        }}
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h1 className={`text-4xl font-bold text-gray-900 dark:text-white mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {title}
            </h1>
            <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? "آخر تحديث" : "Last updated"}: {new Date(termsOfService.lastUpdated).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
            </p>
          </div>

          <div className={`prose prose-lg max-w-none dark:prose-invert ${isRTL ? 'text-right' : 'text-left'}`}>
            <div 
              className={`whitespace-pre-wrap leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
      </div>
    </>
  );
}