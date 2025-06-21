import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Coffee, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/components/ThemeProvider";
import englishDarkLogo from "@assets/english-dark_1750521542838.png";
import englishWhiteLogo from "@assets/english-white_1750516260876.png";
import arabicDarkLogo from "@assets/arabic-dark_1750516613229.png";
import arabicWhiteLogo from "@assets/arabic-white_1750516260877.png";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [location] = useLocation();

  const getLogoSrc = () => {
    if (isRTL) {
      return theme === 'dark' ? arabicWhiteLogo : arabicDarkLogo;
    } else {
      return theme === 'dark' ? englishWhiteLogo : englishDarkLogo;
    }
  };

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/menu", label: t("menu") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img 
              src={getLogoSrc()} 
              alt={isRTL ? "ليت لاونج" : "LateLounge"}
              className="h-12 w-auto object-contain logo-bounce"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors hover:text-primary ${
                  location === link.href
                    ? "text-primary"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Language & Theme Controls */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <LanguageToggle />
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors hover:text-primary ${
                    location === link.href
                      ? "text-primary"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              

            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
