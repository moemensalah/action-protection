import { useLanguage } from "@/hooks/useLanguage";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { SiTiktok } from "react-icons/si";

export function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-12 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">لاونج</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t("brandDescription")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-amber-600 dark:text-amber-400">{t("quickLinks")}</h4>
            <div className="space-y-2">
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
            </div>
          </div>

          {/* Contact Info & Social Media */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-amber-600 dark:text-amber-400">{t("contactInfo")}</h4>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>📍 {t("address")}</p>
              <p>📞 +966 12 345 6789</p>
              <p>📱 +966 50 123 4567</p>
              <p>✉️ info@lounge.sa</p>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4 pt-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-pink-500 transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-purple-500 transition-colors"
              >
                <SiTiktok className="h-6 w-6" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">{t("rights")}</p>
        </div>
      </div>
    </footer>
  );
}