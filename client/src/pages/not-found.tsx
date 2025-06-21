import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <SEO 
        title={isRTL ? "الصفحة غير موجودة - 404" : "Page Not Found - 404"}
        description={isRTL 
          ? "عذراً، الصفحة التي تبحث عنها غير موجودة. عد إلى الصفحة الرئيسية لليت لاونج أو تصفح قائمتنا."
          : "Sorry, the page you're looking for doesn't exist. Return to LateLounge homepage or browse our menu."
        }
        url="/404"
        type="website"
      />
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {isRTL ? "الصفحة غير موجودة" : "Page Not Found"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isRTL 
              ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
              : "Sorry, the page you're looking for doesn't exist or has been moved."
            }
          </p>
          <Link href="/">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              {isRTL ? "العودة للرئيسية" : "Back to Home"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
