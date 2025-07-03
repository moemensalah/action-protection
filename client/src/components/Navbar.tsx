import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Coffee, Search, Menu, X, User, Package, MapPin, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { CartDropdown } from "@/components/CartDropdown";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const { user, isLoading } = useAuth();
  const typedUser = user as User | undefined;
  const [location] = useLocation();

  const getLogoSrc = () => {
    // Use dark logo for dark mode, white logo for light mode
    return theme === 'dark' 
      ? "/assets/action-protection-logo-dark.png?v=" + Date.now()
      : "/assets/action-protection-logo-white.png?v=" + Date.now();
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
              key={theme} 
              src={getLogoSrc()} 
              alt={isRTL ? "أكشن بروتكشن" : "Action Protection"}
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
            <CartDropdown />
            
            {/* User Authentication */}
            {!isLoading && (
              typedUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {typedUser.firstName || (isRTL ? "حسابي" : "My Account")}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56">
                    <div className={`px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {typedUser.firstName ? `${typedUser.firstName} ${typedUser.lastName || ''}`.trim() : typedUser.id}
                    </div>
                    <div className={`px-2 py-1 text-xs text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {typedUser.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/my-orders" className={`flex items-center gap-2 w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Package className="h-4 w-4" />
                        {isRTL ? "طلباتي" : "My Orders"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-addresses" className={`flex items-center gap-2 w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <MapPin className="h-4 w-4" />
                        {isRTL ? "عناويني" : "My Addresses"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={async () => {
                        await fetch("/api/auth/local/logout", { method: "POST" });
                        window.location.href = '/';
                      }}
                      className={`flex items-center gap-2 text-red-600 dark:text-red-400 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <LogOut className="h-4 w-4" />
                      {isRTL ? "تسجيل الخروج" : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <LogIn className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {isRTL ? "تسجيل الدخول" : "Login"}
                      </span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                    <Link href="/register">
                      {isRTL ? "إنشاء حساب" : "Sign Up"}
                    </Link>
                  </Button>
                </div>
              )
            )}
            
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
              
              {/* Mobile Authentication */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
                {!isLoading && (
                  typedUser ? (
                    <div className="flex flex-col space-y-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {typedUser.firstName ? `${typedUser.firstName} ${typedUser.lastName || ''}`.trim() : typedUser.id}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {typedUser.email}
                      </div>
                      <Link
                        href="/my-orders"
                        className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        {isRTL ? "طلباتي" : "My Orders"}
                      </Link>
                      <Link
                        href="/my-addresses"
                        className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <MapPin className="h-4 w-4" />
                        {isRTL ? "عناويني" : "My Addresses"}
                      </Link>
                      <button
                        onClick={async () => {
                          setIsMenuOpen(false);
                          await fetch("/api/auth/local/logout", { method: "POST" });
                          window.location.href = '/';
                        }}
                        className={`flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                      >
                        <LogOut className="h-4 w-4" />
                        {isRTL ? "تسجيل الخروج" : "Logout"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Link
                        href="/login"
                        className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogIn className="h-4 w-4" />
                        {isRTL ? "تسجيل الدخول" : "Login"}
                      </Link>
                      <Link
                        href="/register"
                        className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        {isRTL ? "إنشاء حساب" : "Sign Up"}
                      </Link>
                    </div>
                  )
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
