import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";

interface PrivacyPolicy {
  id: number;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  lastUpdated: string;
  isActive: boolean;
}

export default function PrivacyPolicy() {
  const { isRTL } = useLanguage();

  const { data: privacyPolicy, isLoading } = useQuery<PrivacyPolicy>({
    queryKey: ["/api/privacy-policy"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!privacyPolicy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {isRTL ? "سياسة الخصوصية غير متوفرة" : "Privacy Policy Not Available"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? "يرجى المحاولة مرة أخرى لاحقاً" : "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  const title = isRTL ? privacyPolicy.titleAr : privacyPolicy.titleEn;
  const content = isRTL ? privacyPolicy.contentAr : privacyPolicy.contentEn;

  return (
    <>
      <SEO
        title={`${title} | ${isRTL ? "ليت لاونج" : "LateLounge"}`}
        description={isRTL ? "سياسة الخصوصية لليت لاونج" : "Privacy Policy for LateLounge"}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          description: isRTL ? "سياسة الخصوصية" : "Privacy Policy",
          dateModified: privacyPolicy.lastUpdated,
        }}
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h1 className={`text-4xl font-bold text-gray-900 dark:text-white mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {title}
            </h1>
            <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? "آخر تحديث" : "Last updated"}: {new Date(privacyPolicy.lastUpdated).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
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