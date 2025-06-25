import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Server, Shield, Eye, EyeOff } from "lucide-react";

interface SmtpSettingsForm {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
}

export default function SmtpSettings() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<SmtpSettingsForm>({
    host: "smtp.postmarkapp.com",
    port: 587,
    username: "",
    password: "",
    fromEmail: "",
    fromName: "",
    isActive: true,
  });

  // Fetch current SMTP settings
  const { data: smtpSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/smtp-settings"],
  });

  // Update form when data loads
  useEffect(() => {
    if (smtpSettings) {
      setFormData({
        host: smtpSettings.host || "smtp.postmarkapp.com",
        port: smtpSettings.port || 587,
        username: smtpSettings.username || "",
        password: smtpSettings.password || "",
        fromEmail: smtpSettings.fromEmail || "",
        fromName: smtpSettings.fromName || "",
        isActive: smtpSettings.isActive ?? true,
      });
    }
  }, [smtpSettings]);

  // Save SMTP settings mutation
  const saveMutation = useMutation({
    mutationFn: async (data: SmtpSettingsForm) => {
      return await apiRequest("/api/admin/smtp-settings", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/smtp-settings"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/smtp-settings"] });
      toast({
        title: isRTL ? "تم الحفظ" : "Saved",
        description: isRTL ? "تم حفظ إعدادات البريد الإلكتروني بنجاح" : "SMTP settings saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في حفظ إعدادات البريد الإلكتروني" : "Failed to save SMTP settings",
        variant: "destructive",
      });
    }
  });

  // Test email mutation
  const testMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/smtp-settings/test", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "نجح الاختبار" : "Test Successful",
        description: isRTL ? "تم إرسال بريد إلكتروني تجريبي بنجاح" : "Test email sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: isRTL ? "فشل الاختبار" : "Test Failed",
        description: isRTL ? "فشل في إرسال البريد الإلكتروني التجريبي" : "Failed to send test email",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleTestEmail = () => {
    testMutation.mutate();
  };

  const handleInputChange = (field: keyof SmtpSettingsForm, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">
          {isRTL ? "إعدادات البريد الإلكتروني" : "SMTP Settings"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {isRTL ? "إعدادات خادم البريد الإلكتروني" : "Email Server Configuration"}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? "قم بتكوين إعدادات SMTP لإرسال رسائل البريد الإلكتروني من نموذج الاتصال. يُنصح باستخدام Postmark للحصول على أفضل معدلات التسليم."
              : "Configure SMTP settings for sending emails from the contact form. Postmark is recommended for best delivery rates."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">
                  {isRTL ? "خادم SMTP" : "SMTP Host"}
                </Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder="smtp.postmarkapp.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">
                  {isRTL ? "المنفذ" : "Port"}
                </Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                  placeholder="587"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  {isRTL ? "اسم المستخدم" : "Username"}
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder={isRTL ? "مفتاح API الخاص بـ Postmark" : "Postmark API Key"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {isRTL ? "كلمة المرور" : "Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={isRTL ? "مفتاح API الخاص بـ Postmark" : "Postmark API Key"}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">
                  {isRTL ? "البريد الإلكتروني للمرسل" : "From Email"}
                </Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  placeholder="noreply@yourdomain.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName">
                  {isRTL ? "اسم المرسل" : "From Name"}
                </Label>
                <Input
                  id="fromName"
                  value={formData.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  placeholder={isRTL ? "ليت لاونج" : "LateLounge"}
                  required
                />
              </div>
            </div>

            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">
                {isRTL ? "تفعيل إرسال البريد الإلكتروني" : "Enable Email Sending"}
              </Label>
            </div>

            <div className={`flex gap-4 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button 
                type="submit" 
                disabled={saveMutation.isPending}
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Shield className="h-4 w-4" />
                {saveMutation.isPending 
                  ? (isRTL ? "جاري الحفظ..." : "Saving...") 
                  : (isRTL ? "حفظ الإعدادات" : "Save Settings")
                }
              </Button>

              <Button 
                type="button" 
                variant="outline"
                onClick={handleTestEmail}
                disabled={testMutation.isPending || !formData.fromEmail}
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Mail className="h-4 w-4" />
                {testMutation.isPending 
                  ? (isRTL ? "جاري الإرسال..." : "Sending...") 
                  : (isRTL ? "اختبار البريد الإلكتروني" : "Test Email")
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Postmark Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isRTL ? "تعليمات إعداد Postmark" : "Postmark Setup Instructions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>{isRTL ? "1. إنشاء حساب Postmark:" : "1. Create Postmark Account:"}</strong>
            <p className="text-muted-foreground">
              {isRTL 
                ? "قم بزيارة postmarkapp.com وأنشئ حساباً جديداً"
                : "Visit postmarkapp.com and create a new account"
              }
            </p>
          </div>
          <div>
            <strong>{isRTL ? "2. الحصول على مفتاح API:" : "2. Get API Key:"}</strong>
            <p className="text-muted-foreground">
              {isRTL 
                ? "انتقل إلى Server > API Tokens وأنشئ مفتاح API جديد"
                : "Go to Server > API Tokens and create a new API token"
              }
            </p>
          </div>
          <div>
            <strong>{isRTL ? "3. التكوين:" : "3. Configuration:"}</strong>
            <p className="text-muted-foreground">
              {isRTL 
                ? "استخدم مفتاح API في حقلي اسم المستخدم وكلمة المرور أعلاه"
                : "Use the API key in both Username and Password fields above"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}