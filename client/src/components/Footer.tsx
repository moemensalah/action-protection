import { useLanguage } from "@/hooks/useLanguage";
import { Facebook, Instagram, Linkedin, Youtube, Twitter, CreditCard, Smartphone } from "lucide-react";
import { SiTiktok, SiSnapchat, SiVisa, SiApplepay } from "react-icons/si";
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
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export function Footer() {
  const { t, isRTL } = useLanguage();

  const { data: footerContent, isLoading: footerLoading } = useQuery<FooterContent>({
    queryKey: ["/api/footer"],
  });

  const { data: contactData, isLoading: contactLoading } = useQuery<ContactUs>({
    queryKey: ["/api/contact"],
  });

  const isLoading = footerLoading || contactLoading;

  return (
    <>
      {/* Payment Methods Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("acceptedPaymentMethods")}
            </h3>
            <div className="flex justify-center items-center gap-8">
              {/* Visa */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-sm">
                <SiVisa className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa</span>
              </div>
              
              {/* KNET */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-sm">
                <CreditCard className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">KNET</span>
              </div>
              
              {/* Apple Pay */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-sm">
                <SiApplepay className="w-8 h-8 text-gray-800 dark:text-white" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Apple Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-12 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            {isLoading ? (
              <>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
                </div>
              </>
            ) : footerContent ? (
              <>
                <h3 className={`text-2xl font-bold text-amber-600 dark:text-amber-400 ${isRTL ? 'arabic-brand' : ''}`}>
                  {isRTL ? footerContent.companyNameAr : footerContent.companyNameEn}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {isRTL ? footerContent.descriptionAr : footerContent.descriptionEn}
                </p>
              </>
            ) : null}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-amber-600 dark:text-amber-400">{t("quickLinks")}</h4>
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
                ))
              ) : footerContent?.quickLinks && footerContent.quickLinks.length > 0 ? (
                footerContent.quickLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url} 
                    className="block text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {isRTL ? link.nameAr : link.nameEn}
                  </a>
                ))
              ) : null}
            </div>
          </div>

          {/* Contact Info & Social Media */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-amber-600 dark:text-amber-400">{t("contactInfo")}</h4>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28 animate-pulse"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-36 animate-pulse"></div>
                <div className="flex space-x-4 rtl:space-x-reverse pt-4">
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
            ) : contactData ? (
              <>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>📍 {t("address")}</p>
                  <p>📞 {contactData.phone}</p>
                  <p>✉️ {contactData.email}</p>
                </div>
                
                {/* Social Media Icons */}
                <div className="flex space-x-4 rtl:space-x-reverse pt-4">
                  {contactData.socialMediaLinks?.instagram && (
                    <a 
                      href={contactData.socialMediaLinks.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-300 hover:text-pink-500 transition-colors"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                  )}
                  {contactData.socialMediaLinks?.twitter && (
                    <a 
                      href={contactData.socialMediaLinks.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-400 transition-colors"
                    >
                      <Twitter className="h-6 w-6" />
                    </a>
                  )}
                  {contactData.socialMediaLinks?.facebook && (
                    <a 
                      href={contactData.socialMediaLinks.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
                    >
                      <Facebook className="h-6 w-6" />
                    </a>
                  )}
                  {contactData.socialMediaLinks?.snapchat && (
                    <a 
                      href={contactData.socialMediaLinks.snapchat} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      <SiSnapchat className="h-6 w-6" />
                    </a>
                  )}
                  {contactData.socialMediaLinks?.linkedin && (
                    <a 
                      href={contactData.socialMediaLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin className="h-6 w-6" />
                    </a>
                  )}
                  {contactData.socialMediaLinks?.youtube && (
                    <a 
                      href={contactData.socialMediaLinks.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Youtube className="h-6 w-6" />
                    </a>
                  )}
                  {contactData.socialMediaLinks?.tiktok && (
                    <a 
                      href={contactData.socialMediaLinks.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-500 transition-colors"
                    >
                      <SiTiktok className="h-6 w-6" />
                    </a>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-8 text-center">
          {isLoading ? (
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48 mx-auto animate-pulse"></div>
          ) : footerContent ? (
            <p className="text-gray-500 dark:text-gray-400">
              {footerContent.copyrightText}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
    </>
  );
}