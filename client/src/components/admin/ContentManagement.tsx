import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Save, Globe, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";

interface AboutUs {
  id?: number;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  image: string;
  isActive: boolean;
}

interface ContactUs {
  id?: number;
  phone: string;
  email: string;
  address: string;
  addressAr: string;
  workingHours: string;
  workingHoursAr: string;
  socialMediaLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    snapchat?: string;
  };
  isActive: boolean;
}

interface FooterContent {
  id?: number;
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

export function ContentManagement() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // About Us state
  const [aboutData, setAboutData] = useState<AboutUs>({
    titleEn: "",
    titleAr: "",
    contentEn: "",
    contentAr: "",
    image: "",
    isActive: true
  });

  // Contact Us state
  const [contactData, setContactData] = useState<ContactUs>({
    phone: "",
    email: "",
    address: "",
    addressAr: "",
    workingHours: "",
    workingHoursAr: "",
    socialMediaLinks: {},
    isActive: true
  });

  // Footer state
  const [footerData, setFooterData] = useState<FooterContent>({
    companyNameEn: "",
    companyNameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    copyrightText: "",
    quickLinks: [],
    isActive: true
  });

  // Terms and Privacy state
  const [termsData, setTermsData] = useState({
    titleEn: "Terms of Service",
    titleAr: "شروط الخدمة",
    contentEn: "",
    contentAr: ""
  });

  const [privacyData, setPrivacyData] = useState({
    titleEn: "Privacy Policy",
    titleAr: "سياسة الخصوصية",
    contentEn: "",
    contentAr: ""
  });

  // Fetch data
  const { data: aboutUs } = useQuery<AboutUs>({
    queryKey: ["/api/about"],
  });

  const { data: contactUs } = useQuery<ContactUs>({
    queryKey: ["/api/contact"],
  });

  const { data: footerContent } = useQuery<FooterContent>({
    queryKey: ["/api/footer"],
  });

  const { data: privacyPolicy } = useQuery({
    queryKey: ["/api/privacy-policy"],
  });

  const { data: termsOfService } = useQuery({
    queryKey: ["/api/terms-of-service"],
  });

  // Update states when data loads
  if (aboutUs && aboutUs !== aboutData) {
    setAboutData(aboutUs);
  }
  if (contactUs && contactUs !== contactData) {
    setContactData(contactUs);
  }
  if (footerContent && footerContent !== footerData) {
    setFooterData(footerContent);
  }
  if (privacyPolicy && privacyPolicy !== privacyData) {
    setPrivacyData(privacyPolicy);
  }
  if (termsOfService && termsOfService !== termsData) {
    setTermsData(termsOfService);
  }

  // Update mutations
  const updateAboutMutation = useMutation({
    mutationFn: async (data: AboutUs) => {
      return await apiRequest("/api/admin/about", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about"] });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تحديث صفحة من نحن بنجاح" : "About us page updated successfully",
      });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: ContactUs) => {
      return await apiRequest("/api/admin/contact", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تحديث معلومات الاتصال بنجاح" : "Contact information updated successfully",
      });
    }
  });

  const updateFooterMutation = useMutation({
    mutationFn: async (data: FooterContent) => {
      return await apiRequest("/api/admin/footer", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/footer"] });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تحديث محتوى التذييل بنجاح" : "Footer content updated successfully",
      });
    }
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/privacy-policy", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/privacy-policy"] });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تحديث سياسة الخصوصية بنجاح" : "Privacy Policy updated successfully",
      });
    }
  });

  const updateTermsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/terms-of-service", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms-of-service"] });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تحديث شروط الخدمة بنجاح" : "Terms of Service updated successfully",
      });
    }
  });

  const addQuickLink = () => {
    setFooterData(prev => ({
      ...prev,
      quickLinks: [...prev.quickLinks, { nameEn: "", nameAr: "", url: "" }]
    }));
  };

  const updateQuickLink = (index: number, field: string, value: string) => {
    setFooterData(prev => ({
      ...prev,
      quickLinks: prev.quickLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeQuickLink = (index: number) => {
    setFooterData(prev => ({
      ...prev,
      quickLinks: prev.quickLinks.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className={isRTL ? 'text-right' : 'text-left'}>
        <h2 className={`text-2xl font-bold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? "إدارة المحتوى" : "Content Management"}
        </h2>
        <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? "إدارة محتوى الصفحات والمعلومات الثابتة" : "Manage page content and static information"}
        </p>
      </div>

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="about">{isRTL ? "من نحن" : "About Us"}</TabsTrigger>
          <TabsTrigger value="contact">{isRTL ? "اتصل بنا" : "Contact"}</TabsTrigger>
          <TabsTrigger value="footer">{isRTL ? "التذييل" : "Footer"}</TabsTrigger>
          <TabsTrigger value="terms">{isRTL ? "الشروط" : "Terms"}</TabsTrigger>
          <TabsTrigger value="privacy">{isRTL ? "الخصوصية" : "Privacy"}</TabsTrigger>
        </TabsList>

        {/* About Us */}
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <FileText className="h-5 w-5" />
                {isRTL ? "صفحة من نحن" : "About Us Page"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); updateAboutMutation.mutate(aboutData); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aboutTitleEn" className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "العنوان بالإنجليزية" : "Title (English)"}</Label>
                    <Input
                      id="aboutTitleEn"
                      value={aboutData.titleEn}
                      onChange={(e) => setAboutData(prev => ({ ...prev, titleEn: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="aboutTitleAr">{isRTL ? "العنوان بالعربية" : "Title (Arabic)"}</Label>
                    <Input
                      id="aboutTitleAr"
                      value={aboutData.titleAr}
                      onChange={(e) => setAboutData(prev => ({ ...prev, titleAr: e.target.value }))}
                      required
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="aboutImage">{isRTL ? "رابط الصورة" : "Image URL"}</Label>
                  <Input
                    id="aboutImage"
                    value={aboutData.image}
                    onChange={(e) => setAboutData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aboutContentEn">{isRTL ? "المحتوى بالإنجليزية" : "Content (English)"}</Label>
                    <Textarea
                      id="aboutContentEn"
                      value={aboutData.contentEn}
                      onChange={(e) => setAboutData(prev => ({ ...prev, contentEn: e.target.value }))}
                      rows={8}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="aboutContentAr">{isRTL ? "المحتوى بالعربية" : "Content (Arabic)"}</Label>
                    <Textarea
                      id="aboutContentAr"
                      value={aboutData.contentAr}
                      onChange={(e) => setAboutData(prev => ({ ...prev, contentAr: e.target.value }))}
                      rows={8}
                      required
                      dir="rtl"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={updateAboutMutation.isPending} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isRTL ? "حفظ التغييرات" : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Us */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {isRTL ? "معلومات الاتصال" : "Contact Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); updateContactMutation.mutate(contactData); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {isRTL ? "رقم الهاتف" : "Phone Number"}
                    </Label>
                    <Input
                      id="phone"
                      value={contactData.phone}
                      onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+966 11 123 4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {isRTL ? "البريد الإلكتروني" : "Email"}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="info@latelounge.sa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {isRTL ? "العنوان بالإنجليزية" : "Address (English)"}
                    </Label>
                    <Textarea
                      id="address"
                      value={contactData.address}
                      onChange={(e) => setContactData(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressAr" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {isRTL ? "العنوان بالعربية" : "Address (Arabic)"}
                    </Label>
                    <Textarea
                      id="addressAr"
                      value={contactData.addressAr}
                      onChange={(e) => setContactData(prev => ({ ...prev, addressAr: e.target.value }))}
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workingHours" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {isRTL ? "ساعات العمل بالإنجليزية" : "Working Hours (English)"}
                    </Label>
                    <Input
                      id="workingHours"
                      value={contactData.workingHours}
                      onChange={(e) => setContactData(prev => ({ ...prev, workingHours: e.target.value }))}
                      placeholder="Sun-Thu: 7AM-11PM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workingHoursAr" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {isRTL ? "ساعات العمل بالعربية" : "Working Hours (Arabic)"}
                    </Label>
                    <Input
                      id="workingHoursAr"
                      value={contactData.workingHoursAr}
                      onChange={(e) => setContactData(prev => ({ ...prev, workingHoursAr: e.target.value }))}
                      placeholder="الأحد-الخميس: 7ص-11م"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {isRTL ? "روابط وسائل التواصل الاجتماعي" : "Social Media Links"}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <Input
                      placeholder="Instagram URL"
                      value={contactData.socialMediaLinks?.instagram || ""}
                      onChange={(e) => setContactData(prev => ({
                        ...prev,
                        socialMediaLinks: { ...prev.socialMediaLinks, instagram: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Twitter URL"
                      value={contactData.socialMediaLinks?.twitter || ""}
                      onChange={(e) => setContactData(prev => ({
                        ...prev,
                        socialMediaLinks: { ...prev.socialMediaLinks, twitter: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Facebook URL"
                      value={contactData.socialMediaLinks?.facebook || ""}
                      onChange={(e) => setContactData(prev => ({
                        ...prev,
                        socialMediaLinks: { ...prev.socialMediaLinks, facebook: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Snapchat URL"
                      value={contactData.socialMediaLinks?.snapchat || ""}
                      onChange={(e) => setContactData(prev => ({
                        ...prev,
                        socialMediaLinks: { ...prev.socialMediaLinks, snapchat: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={updateContactMutation.isPending} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isRTL ? "حفظ التغييرات" : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>
                {isRTL ? "محتوى التذييل" : "Footer Content"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); updateFooterMutation.mutate(footerData); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyNameEn">{isRTL ? "اسم الشركة بالإنجليزية" : "Company Name (English)"}</Label>
                    <Input
                      id="companyNameEn"
                      value={footerData.companyNameEn}
                      onChange={(e) => setFooterData(prev => ({ ...prev, companyNameEn: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyNameAr">{isRTL ? "اسم الشركة بالعربية" : "Company Name (Arabic)"}</Label>
                    <Input
                      id="companyNameAr"
                      value={footerData.companyNameAr}
                      onChange={(e) => setFooterData(prev => ({ ...prev, companyNameAr: e.target.value }))}
                      required
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="descriptionEn">{isRTL ? "الوصف بالإنجليزية" : "Description (English)"}</Label>
                    <Textarea
                      id="descriptionEn"
                      value={footerData.descriptionEn}
                      onChange={(e) => setFooterData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionAr">{isRTL ? "الوصف بالعربية" : "Description (Arabic)"}</Label>
                    <Textarea
                      id="descriptionAr"
                      value={footerData.descriptionAr}
                      onChange={(e) => setFooterData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="copyright">{isRTL ? "نص حقوق النشر" : "Copyright Text"}</Label>
                  <Input
                    id="copyright"
                    value={footerData.copyrightText}
                    onChange={(e) => setFooterData(prev => ({ ...prev, copyrightText: e.target.value }))}
                    placeholder="© 2024 LateLounge. All rights reserved."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>{isRTL ? "الروابط السريعة" : "Quick Links"}</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addQuickLink}>
                      {isRTL ? "إضافة رابط" : "Add Link"}
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {footerData.quickLinks.map((link, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                        <Input
                          placeholder={isRTL ? "الاسم بالإنجليزية" : "Name (English)"}
                          value={link.nameEn}
                          onChange={(e) => updateQuickLink(index, 'nameEn', e.target.value)}
                        />
                        <Input
                          placeholder={isRTL ? "الاسم بالعربية" : "Name (Arabic)"}
                          value={link.nameAr}
                          onChange={(e) => updateQuickLink(index, 'nameAr', e.target.value)}
                          dir="rtl"
                        />
                        <Input
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeQuickLink(index)}
                        >
                          {isRTL ? "حذف" : "Remove"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={updateFooterMutation.isPending} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isRTL ? "حفظ التغييرات" : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terms of Service */}
        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>
                {isRTL ? "شروط الخدمة" : "Terms of Service"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="termsContentEn">{isRTL ? "المحتوى بالإنجليزية" : "Content (English)"}</Label>
                    <Textarea
                      id="termsContentEn"
                      value={termsData.contentEn}
                      onChange={(e) => setTermsData(prev => ({ ...prev, contentEn: e.target.value }))}
                      rows={12}
                      placeholder="Enter terms of service content in English..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="termsContentAr">{isRTL ? "المحتوى بالعربية" : "Content (Arabic)"}</Label>
                    <Textarea
                      id="termsContentAr"
                      value={termsData.contentAr}
                      onChange={(e) => setTermsData(prev => ({ ...prev, contentAr: e.target.value }))}
                      rows={12}
                      placeholder="أدخل محتوى شروط الخدمة بالعربية..."
                      dir="rtl"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => updateTermsMutation.mutate(termsData)}
                  disabled={updateTermsMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isRTL ? "حفظ شروط الخدمة" : "Save Terms of Service"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Policy */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <FileText className="h-5 w-5" />
                {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="privacyContentEn" className={isRTL ? 'text-right' : 'text-left'}>
                      {isRTL ? "المحتوى بالإنجليزية" : "Content (English)"}
                    </Label>
                    <Textarea
                      id="privacyContentEn"
                      value={privacyData.contentEn}
                      onChange={(e) => setPrivacyData(prev => ({ ...prev, contentEn: e.target.value }))}
                      rows={12}
                      placeholder="Enter privacy policy content in English..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="privacyContentAr" className={isRTL ? 'text-right' : 'text-left'}>
                      {isRTL ? "المحتوى بالعربية" : "Content (Arabic)"}
                    </Label>
                    <Textarea
                      id="privacyContentAr"
                      value={privacyData.contentAr}
                      onChange={(e) => setPrivacyData(prev => ({ ...prev, contentAr: e.target.value }))}
                      rows={12}
                      placeholder="أدخل محتوى سياسة الخصوصية بالعربية..."
                      dir="rtl"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => updatePrivacyMutation.mutate(privacyData)}
                  disabled={updatePrivacyMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isRTL ? "حفظ سياسة الخصوصية" : "Save Privacy Policy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}