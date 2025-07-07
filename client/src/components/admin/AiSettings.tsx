import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Key, Globe, Wand2 } from "lucide-react";
import { AdminLoading } from "@/components/ui/admin-loading";
import type { AiSettings, InsertAiSettings } from "@shared/schema";

export default function AiSettings() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<InsertAiSettings>({
    midjourney_api_key: "",
    midjourney_api_url: "https://api.midjourney.com/v1",
    enabled: false,
  });

  const { data: aiSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/ai-settings"],
  });

  // Update form data when aiSettings is loaded
  useEffect(() => {
    if (aiSettings) {
      setFormData({
        midjourney_api_key: aiSettings.midjourney_api_key || "",
        midjourney_api_url: aiSettings.midjourney_api_url || "https://api.midjourney.com/v1",
        enabled: aiSettings.enabled || false,
      });
    }
  }, [aiSettings]);

  const mutation = useMutation({
    mutationFn: async (data: InsertAiSettings) => {
      return await apiRequest("/api/admin/ai-settings", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: language === "ar" ? "تم الحفظ بنجاح" : "Settings saved successfully",
        description: language === "ar" ? "تم حفظ إعدادات الذكاء الاصطناعي" : "AI processing settings have been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-settings"] });
    },
    onError: (error) => {
      toast({
        title: language === "ar" ? "خطأ في الحفظ" : "Error saving settings",
        description: error.message || (language === "ar" ? "فشل في حفظ الإعدادات" : "Failed to save AI settings"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return <AdminLoading />;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className={`${isRTL ? "text-right" : "text-left"}`}>
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Wand2 className="h-5 w-5 text-blue-600" />
          <CardTitle>
            {language === "ar" ? "إعدادات الذكاء الاصطناعي" : "AI Processing Settings"}
          </CardTitle>
        </div>
        <CardDescription>
          {language === "ar"
            ? "تكوين إعدادات الذكاء الاصطناعي لتوليد الصور"
            : "Configure AI settings for image generation"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enable AI Processing */}
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`${isRTL ? "text-right" : "text-left"}`}>
              <Label htmlFor="enabled" className="text-sm font-medium">
                {language === "ar" ? "تفعيل الذكاء الاصطناعي" : "Enable AI Processing"}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {language === "ar"
                  ? "تفعيل توليد الصور بالذكاء الاصطناعي"
                  : "Enable AI-powered image generation"}
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enabled: checked })
              }
            />
          </div>

          {/* Midjourney API Key */}
          <div className="space-y-2">
            <Label htmlFor="midjourney_api_key" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Key className="h-4 w-4" />
              {language === "ar" ? "مفتاح API للميدجورني" : "Midjourney API Key"}
            </Label>
            <Input
              id="midjourney_api_key"
              type="password"
              value={formData.midjourney_api_key}
              onChange={(e) =>
                setFormData({ ...formData, midjourney_api_key: e.target.value })
              }
              placeholder={language === "ar" ? "أدخل مفتاح API" : "Enter your Midjourney API key"}
              className={isRTL ? "text-right" : "text-left"}
            />
          </div>

          {/* Midjourney API URL */}
          <div className="space-y-2">
            <Label htmlFor="midjourney_api_url" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Globe className="h-4 w-4" />
              {language === "ar" ? "رابط API للميدجورني" : "Midjourney API URL"}
            </Label>
            <Input
              id="midjourney_api_url"
              type="url"
              value={formData.midjourney_api_url}
              onChange={(e) =>
                setFormData({ ...formData, midjourney_api_url: e.target.value })
              }
              placeholder="https://api.midjourney.com/v1"
              className={isRTL ? "text-right" : "text-left"}
            />
          </div>

          {/* Save Button */}
          <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                </div>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}