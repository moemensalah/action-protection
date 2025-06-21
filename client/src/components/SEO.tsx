import { useLanguage } from "@/hooks/useLanguage";
import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

export function SEO({
  title,
  description,
  keywords,
  image = "/og-image.jpg",
  url,
  type = "website",
  structuredData
}: SEOProps) {
  const { language, isRTL } = useLanguage();
  
  const siteName = isRTL ? "ليت لاونج" : "LateLounge";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = `${baseUrl}${image}`;
  
  const defaultTitle = isRTL ? "ليت لاونج - تجربة قهوة مميزة" : "LateLounge - Premium Coffee Experience";
  const defaultDescription = isRTL 
    ? "استمتع بأفضل أنواع القهوة والمأكولات اللذيذة في أجواء دافئة ومريحة. قائمة طعامنا المنتقاة بعناية تتميز بمكونات طازجة ونكهات أصيلة."
    : "Experience the finest coffee and culinary delights at LateLounge. Our carefully curated menu features premium ingredients and authentic flavors in a warm, inviting atmosphere.";
  
  const defaultKeywords = isRTL
    ? "قهوة, مقهى, ليت لاونج, قهوة مميزة, مشروبات ساخنة, حلويات, فطار, غداء, الرياض, السعودية"
    : "coffee, cafe, lounge, premium coffee, hot beverages, desserts, breakfast, lunch, riyadh, saudi arabia";

  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} dir={isRTL ? "rtl" : "ltr"} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content={siteName} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={isRTL ? "ar_SA" : "en_US"} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#d97706" />
      <meta name="msapplication-TileColor" content="#d97706" />
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Default structured data for the website
export const getOrganizationSchema = (isRTL: boolean) => ({
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": isRTL ? "ليت لاونج" : "LateLounge",
  "description": isRTL 
    ? "مقهى مميز يقدم أفضل أنواع القهوة والمأكولات في أجواء دافئة ومريحة"
    : "Premium cafe offering the finest coffee and culinary delights in a warm, inviting atmosphere",
  "url": typeof window !== "undefined" ? window.location.origin : "",
  "logo": typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "",
  "image": typeof window !== "undefined" ? `${window.location.origin}/og-image.jpg` : "",
  "telephone": "+966123456789",
  "email": "info@latelounge.sa",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": isRTL ? "شارع الملك فهد" : "King Fahd Road",
    "addressLocality": isRTL ? "الرياض" : "Riyadh",
    "addressCountry": "SA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "24.7136",
    "longitude": "46.6753"
  },
  "openingHours": [
    "Mo-Su 06:00-23:00"
  ],
  "servesCuisine": [
    "Coffee",
    "Breakfast",
    "Light Meals",
    "Desserts"
  ],
  "priceRange": "$$",
  "paymentAccepted": "Cash, Credit Card, Digital Payment",
  "currenciesAccepted": "SAR"
});

export const getMenuSchema = (isRTL: boolean) => ({
  "@context": "https://schema.org",
  "@type": "Menu",
  "name": isRTL ? "قائمة ليت لاونج" : "LateLounge Menu",
  "description": isRTL 
    ? "قائمة شاملة تضم أفضل أنواع القهوة والمشروبات والمأكولات"
    : "Comprehensive menu featuring premium coffee, beverages, and culinary delights",
  "hasMenuSection": [
    {
      "@type": "MenuSection",
      "name": isRTL ? "القهوة والإسبريسو" : "Coffee & Espresso",
      "description": isRTL ? "مجموعة مميزة من القهوة المحضرة بخبرة" : "Premium coffee selection expertly crafted"
    },
    {
      "@type": "MenuSection", 
      "name": isRTL ? "المشروبات الباردة" : "Cold Beverages",
      "description": isRTL ? "مشروبات منعشة مثالية لجميع الأوقات" : "Refreshing drinks perfect for any time"
    },
    {
      "@type": "MenuSection",
      "name": isRTL ? "الإفطار" : "Breakfast", 
      "description": isRTL ? "خيارات إفطار لذيذة ومغذية" : "Delicious and nutritious breakfast options"
    },
    {
      "@type": "MenuSection",
      "name": isRTL ? "الحلويات" : "Desserts",
      "description": isRTL ? "حلويات شهية محضرة طازجة" : "Delectable desserts made fresh daily"
    },
    {
      "@type": "MenuSection",
      "name": isRTL ? "الأطباق الرئيسية" : "Main Dishes", 
      "description": isRTL ? "أطباق رئيسية متنوعة ولذيذة" : "Diverse and delicious main course options"
    }
  ]
});

export const getBreadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": typeof window !== "undefined" ? `${window.location.origin}${item.url}` : item.url
  }))
});