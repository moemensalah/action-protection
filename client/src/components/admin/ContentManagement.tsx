import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Save, Globe, Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react";
import AiSettings from "./AiSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";

interface Feature {
  icon: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
}

interface AboutUs {
  id?: number;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  features: Feature[];
  missionEn?: string;
  missionAr?: string;
  image: string;
  mapUrl?: string;
  isActive: boolean;
}

interface ContactUs {
  id?: number;
  phone: string;
  whatsapp?: string;
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
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  googleMapsUrl?: string;
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
    features: [],
    missionEn: "",
    missionAr: "",
    image: "",
    mapUrl: "",
    isActive: true
  });

  // Contact Us state
  const [contactData, setContactData] = useState<ContactUs>({
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    addressAr: "",
    workingHours: "",
    workingHoursAr: "",
    socialMediaLinks: {},
    googleMapsUrl: "",
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

  // Tawk.to Chat Widget state
  const [tawkData, setTawkData] = useState({
    propertyId: "6856e499f4cfc5190e97ea98",
    widgetId: "1iu9mpub8",
    isActive: true
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

  const { data: tawkWidget } = useQuery({
    queryKey: ["/api/widgets/tawk_chat"],
  });

  // Update states when data loads
  useEffect(() => {
    if (aboutUs) {
      setAboutData({
        titleEn: aboutUs.titleEn || "",
        titleAr: aboutUs.titleAr || "",
        contentEn: aboutUs.contentEn || "",
        contentAr: aboutUs.contentAr || "",
        features: aboutUs.features || [],
        missionEn: aboutUs.missionEn || "",
        missionAr: aboutUs.missionAr || "",
        image: aboutUs.image || "",
        mapUrl: aboutUs.mapUrl || "",
        isActive: aboutUs.isActive ?? true
      });
    }
  }, [aboutUs]);

  useEffect(() => {
    if (contactUs) {
      setContactData({
        phone: contactUs.phone || "",
        whatsapp: contactUs.whatsapp || "",
        email: contactUs.email || "",
        address: contactUs.address || "",
        addressAr: contactUs.addressAr || "",
        workingHours: contactUs.workingHours || "",
        workingHoursAr: contactUs.workingHoursAr || "",
        socialMediaLinks: contactUs.socialMediaLinks || {},
        googleMapsUrl: contactUs.googleMapsUrl || "",
        isActive: contactUs.isActive ?? true
      });
    }
  }, [contactUs]);

  useEffect(() => {
    if (footerContent) {
      setFooterData({
        companyNameEn: footerContent.companyNameEn || "",
        companyNameAr: footerContent.companyNameAr || "",
        descriptionEn: footerContent.descriptionEn || "",
        descriptionAr: footerContent.descriptionAr || "",
        copyrightText: footerContent.copyrightText || "",
        quickLinks: footerContent.quickLinks || [],
        isActive: footerContent.isActive ?? true
      });
    }
  }, [footerContent]);

  useEffect(() => {
    if (privacyPolicy) {
      setPrivacyData({
        titleEn: privacyPolicy.titleEn || "Privacy Policy",
        titleAr: privacyPolicy.titleAr || "سياسة الخصوصية",
        contentEn: privacyPolicy.contentEn || "",
        contentAr: privacyPolicy.contentAr || ""
      });
    }
  }, [privacyPolicy]);

  useEffect(() => {
    if (termsOfService) {
      setTermsData({
        titleEn: termsOfService.titleEn || "Terms of Service",
        titleAr: termsOfService.titleAr || "شروط الخدمة",
        contentEn: termsOfService.contentEn || "",
        contentAr: termsOfService.contentAr || ""
      });
    }
  }, [termsOfService]);

  useEffect(() => {
    if (tawkWidget && tawkWidget.settings) {
      setTawkData({
        propertyId: tawkWidget.settings.propertyId || "6856e499f4cfc5190e97ea98",
        widgetId: tawkWidget.settings.widgetId || "1iu9mpub8",
        isActive: tawkWidget.isActive !== undefined ? tawkWidget.isActive : true
      });
    }
  }, [tawkWidget]);

  // Update mutations
  const updateAboutMutation = useMutation({
    mutationFn: async (data: AboutUs) => {
      // Filter out database-only fields to prevent timestamp errors
      const cleanData = {
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        contentEn: data.contentEn,
        contentAr: data.contentAr,
        features: data.features,
        missionEn: data.missionEn,
        missionAr: data.missionAr,
        image: data.image,
        mapUrl: data.mapUrl,
        isActive: data.isActive
      };
      return await apiRequest("/api/admin/about", {
        method: "PUT",
        body: JSON.stringify(cleanData),
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
      // Filter out database-only fields to prevent timestamp errors
      const cleanData = {
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        address: data.address,
        addressAr: data.addressAr,
        workingHours: data.workingHours,
        workingHoursAr: data.workingHoursAr,
        socialMediaLinks: data.socialMediaLinks,
        googleMapsUrl: data.googleMapsUrl,
        isActive: data.isActive
      };
      return await apiRequest("/api/admin/contact", {
        method: "PUT",
        body: JSON.stringify(cleanData),
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
      // Filter out database-only fields to prevent timestamp errors
      const cleanData = {
        companyNameEn: data.companyNameEn,
        companyNameAr: data.companyNameAr,
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        copyrightText: data.copyrightText,
        quickLinks: data.quickLinks,
        isActive: data.isActive
      };
      return await apiRequest("/api/admin/footer", {
        method: "PUT",
        body: JSON.stringify(cleanData),
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

  const updateTawkMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/widgets", {
        method: "PUT",
        body: JSON.stringify({
          name: "tawk_chat",
          titleEn: "Tawk.to Chat Widget",
          titleAr: "ودجة الدردشة",
          settings: {
            propertyId: data.propertyId,
            widgetId: data.widgetId
          },
          isActive: data.isActive
        }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/widgets/tawk_chat"] });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تحديث إعدادات الدردشة بنجاح" : "Chat widget settings updated successfully",
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="about">{isRTL ? "من نحن" : "About Us"}</TabsTrigger>
          <TabsTrigger value="contact">{isRTL ? "اتصل بنا" : "Contact"}</TabsTrigger>
          <TabsTrigger value="footer">{isRTL ? "التذييل" : "Footer"}</TabsTrigger>
          <TabsTrigger value="terms">{isRTL ? "الشروط" : "Terms"}</TabsTrigger>
          <TabsTrigger value="privacy">{isRTL ? "الخصوصية" : "Privacy"}</TabsTrigger>
          <TabsTrigger value="chat">{isRTL ? "الدردشة" : "Chat"}</TabsTrigger>
          <TabsTrigger value="ai">{isRTL ? "الذكاء الاصطناعي" : "AI Settings"}</TabsTrigger>
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
                    <Label htmlFor="aboutTitleEn" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "العنوان بالإنجليزية" : "Title (English)"}</Label>
                    <Input
                      id="aboutTitleEn"
                      value={aboutData.titleEn}
                      onChange={(e) => setAboutData(prev => ({ ...prev, titleEn: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="aboutTitleAr" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "العنوان بالعربية" : "Title (Arabic)"}</Label>
                    <Input
                      id="aboutTitleAr"
                      value={aboutData.titleAr}
                      onChange={(e) => setAboutData(prev => ({ ...prev, titleAr: e.target.value }))}
                      required
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aboutImage" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "رابط الصورة" : "Image URL"}</Label>
                    <Input
                      id="aboutImage"
                      value={aboutData.image}
                      onChange={(e) => setAboutData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="aboutMapUrl" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "رابط الخريطة" : "Map URL"}</Label>
                    <Input
                      id="aboutMapUrl"
                      value={aboutData.mapUrl || ""}
                      onChange={(e) => setAboutData(prev => ({ ...prev, mapUrl: e.target.value }))}
                      placeholder="https://maps.google.com/embed?..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aboutContentEn" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "المحتوى بالإنجليزية" : "Content (English)"}</Label>
                    <Textarea
                      id="aboutContentEn"
                      value={aboutData.contentEn}
                      onChange={(e) => setAboutData(prev => ({ ...prev, contentEn: e.target.value }))}
                      rows={8}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="aboutContentAr" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "المحتوى بالعربية" : "Content (Arabic)"}</Label>
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

                {/* Features Management */}
                <div className="space-y-4">
                  <Label className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? "المميزات (ما يميزنا)" : "Features (What Makes Us Special)"}
                  </Label>
                  
                  {aboutData.features.map((feature, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{isRTL ? `المميزة ${index + 1}` : `Feature ${index + 1}`}</h4>
                        <Button 
                          type="button"
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            const newFeatures = aboutData.features.filter((_, i) => i !== index);
                            setAboutData(prev => ({ ...prev, features: newFeatures }));
                          }}
                        >
                          {isRTL ? "حذف" : "Delete"}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`feature-icon-${index}`} className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? "الأيقونة" : "Icon"}
                          </Label>
                          <select
                            id={`feature-icon-${index}`}
                            value={feature.icon}
                            onChange={(e) => {
                              const newFeatures = [...aboutData.features];
                              newFeatures[index] = { ...feature, icon: e.target.value };
                              setAboutData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="Coffee">Coffee</option>
                            <option value="Users">Users</option>
                            <option value="Award">Award</option>
                            <option value="Clock">Clock</option>
                          </select>
                        </div>
                        <div></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`feature-title-en-${index}`} className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? "العنوان بالإنجليزية" : "Title (English)"}
                          </Label>
                          <Input
                            id={`feature-title-en-${index}`}
                            value={feature.titleEn}
                            onChange={(e) => {
                              const newFeatures = [...aboutData.features];
                              newFeatures[index] = { ...feature, titleEn: e.target.value };
                              setAboutData(prev => ({ ...prev, features: newFeatures }));
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`feature-title-ar-${index}`} className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? "العنوان بالعربية" : "Title (Arabic)"}
                          </Label>
                          <Input
                            id={`feature-title-ar-${index}`}
                            value={feature.titleAr}
                            onChange={(e) => {
                              const newFeatures = [...aboutData.features];
                              newFeatures[index] = { ...feature, titleAr: e.target.value };
                              setAboutData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            dir="rtl"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`feature-desc-en-${index}`} className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? "الوصف بالإنجليزية" : "Description (English)"}
                          </Label>
                          <Textarea
                            id={`feature-desc-en-${index}`}
                            value={feature.descEn}
                            onChange={(e) => {
                              const newFeatures = [...aboutData.features];
                              newFeatures[index] = { ...feature, descEn: e.target.value };
                              setAboutData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`feature-desc-ar-${index}`} className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? "الوصف بالعربية" : "Description (Arabic)"}
                          </Label>
                          <Textarea
                            id={`feature-desc-ar-${index}`}
                            value={feature.descAr}
                            onChange={(e) => {
                              const newFeatures = [...aboutData.features];
                              newFeatures[index] = { ...feature, descAr: e.target.value };
                              setAboutData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            rows={3}
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      const newFeature: Feature = {
                        icon: "Coffee",
                        titleEn: "",
                        titleAr: "",
                        descEn: "",
                        descAr: ""
                      };
                      setAboutData(prev => ({ ...prev, features: [...prev.features, newFeature] }));
                    }}
                  >
                    {isRTL ? "إضافة مميزة جديدة" : "Add New Feature"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aboutMissionEn" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "المهمة بالإنجليزية" : "Mission (English)"}</Label>
                    <Textarea
                      id="aboutMissionEn"
                      value={aboutData.missionEn || ""}
                      onChange={(e) => setAboutData(prev => ({ ...prev, missionEn: e.target.value }))}
                      rows={5}
                      placeholder="Our mission and vision..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="aboutMissionAr" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "المهمة بالعربية" : "Mission (Arabic)"}</Label>
                    <Textarea
                      id="aboutMissionAr"
                      value={aboutData.missionAr || ""}
                      onChange={(e) => setAboutData(prev => ({ ...prev, missionAr: e.target.value }))}
                      rows={5}
                      placeholder="مهمتنا ورؤيتنا..."
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
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <Phone className="h-5 w-5" />
                {isRTL ? "معلومات الاتصال" : "Contact Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); updateContactMutation.mutate(contactData); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
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
                    <Label htmlFor="whatsapp" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <MessageSquare className="h-4 w-4" />
                      {isRTL ? "واتساب" : "WhatsApp"}
                    </Label>
                    <Input
                      id="whatsapp"
                      value={contactData.whatsapp || ""}
                      onChange={(e) => setContactData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      placeholder="+966 55 123 4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
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
                    <Label htmlFor="address" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
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
                    <Label htmlFor="addressAr" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
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
                    <Label htmlFor="workingHours" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
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
                    <Label htmlFor="workingHoursAr" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
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
                  <Label className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
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
                    <Input
                      placeholder="LinkedIn URL"
                      value={contactData.socialMediaLinks?.linkedin || ""}
                      onChange={(e) => setContactData(prev => ({
                        ...prev,
                        socialMediaLinks: { ...prev.socialMediaLinks, linkedin: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="YouTube URL"
                      value={contactData.socialMediaLinks?.youtube || ""}
                      onChange={(e) => setContactData(prev => ({
                        ...prev,
                        socialMediaLinks: { ...prev.socialMediaLinks, youtube: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="TikTok URL"
                      value={contactData.socialMediaLinks?.tiktok || ""}
                      onChange={(e) => setContactData(prev => ({
                        ...prev,
                        socialMediaLinks: { ...prev.socialMediaLinks, tiktok: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="googleMapsUrl" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <MapPin className="h-4 w-4" />
                    {isRTL ? "رابط خرائط جوجل" : "Google Maps URL"}
                  </Label>
                  <Input
                    id="googleMapsUrl"
                    value={contactData.googleMapsUrl || ""}
                    onChange={(e) => setContactData(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                    placeholder="https://maps.google.com/..."
                    dir="ltr"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {isRTL ? "أضف رابط موقعك من خرائط جوجل لتمكين النقر على الخريطة" : "Add your Google Maps location link to enable map click navigation"}
                  </p>
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
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <FileText className="h-5 w-5" />
                {isRTL ? "محتوى التذييل" : "Footer Content"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); updateFooterMutation.mutate(footerData); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyNameEn" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "اسم الشركة بالإنجليزية" : "Company Name (English)"}</Label>
                    <Input
                      id="companyNameEn"
                      value={footerData.companyNameEn}
                      onChange={(e) => setFooterData(prev => ({ ...prev, companyNameEn: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyNameAr" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "اسم الشركة بالعربية" : "Company Name (Arabic)"}</Label>
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
                    <Label htmlFor="descriptionEn" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "الوصف بالإنجليزية" : "Description (English)"}</Label>
                    <Textarea
                      id="descriptionEn"
                      value={footerData.descriptionEn}
                      onChange={(e) => setFooterData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionAr" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "الوصف بالعربية" : "Description (Arabic)"}</Label>
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
                  <Label htmlFor="copyright" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "نص حقوق النشر" : "Copyright Text"}</Label>
                  <Input
                    id="copyright"
                    value={footerData.copyrightText}
                    onChange={(e) => setFooterData(prev => ({ ...prev, copyrightText: e.target.value }))}
                    placeholder="© 2024 LateLounge. All rights reserved."
                  />
                </div>

                <div>
                  <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Label className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "الروابط السريعة" : "Quick Links"}</Label>
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
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <FileText className="h-5 w-5" />
                {isRTL ? "شروط الخدمة" : "Terms of Service"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="termsContentEn" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "المحتوى بالإنجليزية" : "Content (English)"}</Label>
                    <Textarea
                      id="termsContentEn"
                      value={termsData.contentEn}
                      onChange={(e) => setTermsData(prev => ({ ...prev, contentEn: e.target.value }))}
                      rows={12}
                      placeholder="Enter terms of service content in English..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="termsContentAr" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "المحتوى بالعربية" : "Content (Arabic)"}</Label>
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
                    <Label htmlFor="privacyContentEn" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
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
                    <Label htmlFor="privacyContentAr" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
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

        {/* Chat Widget Configuration */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <FileText className="h-5 w-5" />
                {isRTL ? "إعدادات الدردشة" : "Chat Widget Settings"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tawkPropertyId" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? "معرف الموقع (Property ID)" : "Property ID"}
                    </Label>
                    <Input
                      id="tawkPropertyId"
                      value={tawkData.propertyId}
                      onChange={(e) => setTawkData(prev => ({ ...prev, propertyId: e.target.value }))}
                      placeholder="5f8b4c2d4..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="tawkWidgetId" className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? "معرف الودجة (Widget ID)" : "Widget ID"}
                    </Label>
                    <Input
                      id="tawkWidgetId"
                      value={tawkData.widgetId}
                      onChange={(e) => setTawkData(prev => ({ ...prev, widgetId: e.target.value }))}
                      placeholder="1e2f3g4h5..."
                    />
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <input
                    type="checkbox"
                    id="tawkActive"
                    checked={tawkData.isActive}
                    onChange={(e) => setTawkData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="tawkActive" className={isRTL ? 'text-right' : 'text-left'}>
                    {isRTL ? "تفعيل الدردشة" : "Enable Chat Widget"}
                  </Label>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className={`font-medium text-blue-900 dark:text-blue-100 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? "كيفية الحصول على معرفات Tawk.to" : "How to get Tawk.to IDs"}
                  </h4>
                  <ol className={`list-decimal text-sm text-blue-800 dark:text-blue-200 space-y-1 ${isRTL ? 'list-inside text-right' : 'list-inside text-left'}`}>
                    <li>{isRTL ? "سجل دخول إلى حساب Tawk.to" : "Login to your Tawk.to account"}</li>
                    <li>{isRTL ? "اذهب إلى Administration > Chat Widget" : "Go to Administration > Chat Widget"}</li>
                    <li>{isRTL ? "انسخ Property ID و Widget ID من الكود المضمن" : "Copy Property ID and Widget ID from the embed code"}</li>
                  </ol>
                </div>

                <Button 
                  onClick={() => updateTawkMutation.mutate(tawkData)}
                  disabled={updateTawkMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isRTL ? "حفظ إعدادات الدردشة" : "Save Chat Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai">
          <AiSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}