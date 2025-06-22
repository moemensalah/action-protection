import { useLanguage } from "@/hooks/useLanguage";
import { Facebook, Instagram } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";

interface FooterContent {
  id: number;
  companyNameEn: string;
  companyNameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  copyrightText: string;
  quickLinks: Array<{
    nameEn: string;
    nameAr: string;
    url: string;
  }>;
  isActive: boolean;
}

interface ContactUs {
  phone: string;
  email: string;
  socialMediaLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    snapchat?: string;
  };
}

export function Footer() {
  const { t, isRTL } = useLanguage();

  const { data: footerContent } = useQuery<FooterContent>({
    queryKey: ["/api/footer"],
  });

  const { data: contactData } = useQuery<ContactUs>({
    queryKey: ["/api/contact"],
  });

  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-12 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className={`text-2xl font-bold text-amber-600 dark:text-amber-400 ${isRTL ? 'arabic-brand' : ''}`}>
              {footerContent ? 
                (isRTL ? footerContent.companyNameAr : footerContent.companyNameEn) :
                (isRTL ? "ليت لاونج" : "LateLounge")
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {footerContent ? 
                (isRTL ? footerContent.descriptionAr : footerContent.descriptionEn) :
                t("brandDescription")
              }
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-amber-600 dark:text-amber-400">{t("quickLinks")}</h4>
            <div className="space-y-2">
              {footerContent?.quickLinks && footerContent.quickLinks.length > 0 ? (
                footerContent.quickLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url} 
                    className="block text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {isRTL ? link.nameAr : link.nameEn}
                  </a>
                ))
              ) : (
                <>
                  <a href="/" className="block text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    {t("home")}
                  </a>
                  <a href="/menu" className="block text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    {t("menu")}
                  </a>
                  <a href="/about" className="block text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    {t("about")}
                  </a>
                  <a href="/contact" className="block text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    {t("contact")}
                  </a>
                  <a href="/privacy-policy" className="block text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
                  </a>
                  <a href="/terms-of-service" className="block text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    {isRTL ? "شروط الخدمة" : "Terms of Service"}
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Contact Info & Social Media */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-amber-600 dark:text-amber-400">{t("contactInfo")}</h4>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>📍 {t("address")}</p>
              <p>📞 {contactData?.phone || "+966 12 345 6789"}</p>
              <p>✉️ {contactData?.email || "info@lounge.sa"}</p>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4 rtl:space-x-reverse pt-4">
              <a 
                href={contactData?.socialMediaLinks?.instagram || "https://instagram.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-pink-500 transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href={contactData?.socialMediaLinks?.twitter || "https://twitter.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-purple-500 transition-colors"
              >
                <SiTiktok className="h-6 w-6" />
              </a>
              <a 
                href={contactData?.socialMediaLinks?.facebook || "https://facebook.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {footerContent?.copyrightText || t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}