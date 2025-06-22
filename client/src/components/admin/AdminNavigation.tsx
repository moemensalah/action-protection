import { Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/hooks/useLanguage";

export function AdminNavigation() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, isRTL } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="flex items-center gap-2"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="hidden sm:inline">
          {theme === 'dark' ? (isRTL ? 'فاتح' : 'Light') : (isRTL ? 'داكن' : 'Dark')}
        </span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        className="flex items-center gap-2"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">
          {language === 'ar' ? 'English' : 'العربية'}
        </span>
      </Button>
    </div>
  );
}