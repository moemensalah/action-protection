import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Footer } from "@/components/Footer";
import { SEO, getBreadcrumbSchema } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ContactUs {
  id: number;
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

export default function Contact() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();

  const { data: contactData } = useQuery<ContactUs>({
    queryKey: ["/api/contact"],
  });
  
  const breadcrumbItems = [
    { name: t("home"), url: "/" },
    { name: t("contact"), url: "/contact" }
  ];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: isRTL ? "تم إرسال الرسالة" : "Message Sent",
      description: isRTL 
        ? "شكراً لتواصلك معنا. سنرد عليك قريباً!" 
        : "Thank you for contacting us. We'll get back to you soon!",
    });

    setFormData({ name: "", email: "", phone: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: MapPin,
      titleEn: "Address",
      titleAr: "العنوان",
      valueEn: contactData?.address || "123 Coffee Street, Downtown",
      valueAr: contactData?.addressAr || "123 شارع القهوة، وسط المدينة",
    },
    {
      icon: Phone,
      titleEn: "Phone",
      titleAr: "الهاتف",
      valueEn: contactData?.phone || "+1 (555) 123-4567",
      valueAr: contactData?.phone || "+1 (555) 123-4567",
    },
    {
      icon: Mail,
      titleEn: "Email",
      titleAr: "البريد الإلكتروني",
      valueEn: contactData?.email || "info@cafearabica.com",
      valueAr: contactData?.email || "info@cafearabica.com",
    },
    {
      icon: Clock,
      titleEn: "Hours",
      titleAr: "ساعات العمل",
      valueEn: contactData?.workingHours || "Mon-Sun: 7:00 AM - 10:00 PM",
      valueAr: contactData?.workingHoursAr || "الاثنين-الأحد: 7:00 ص - 10:00 م",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <SEO 
        title={isRTL ? "اتصل بنا" : "Contact Us"}
        description={isRTL 
          ? "تواصل مع ليت لاونج - نحن هنا لخدمتك. اتصل بنا أو زر موقعنا للاستمتاع بأفضل تجربة قهوة. مفتوح يومياً من 6 صباحاً حتى 11 مساءً."
          : "Contact LateLounge - We're here to serve you. Call us or visit our location for the finest coffee experience. Open daily from 6 AM to 11 PM."
        }
        keywords={isRTL
          ? "اتصل بنا, عنوان ليت لاونج, رقم الهاتف, البريد الإلكتروني, ساعات العمل, موقعنا"
          : "contact us, LateLounge address, phone number, email, opening hours, location"
        }
        url="/contact"
        type="website"
        structuredData={getBreadcrumbSchema(breadcrumbItems)}
      />
      <AnimatedBackground />
      {/* Hero Section */}
      <section className="relative h-64 gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-black/50"></div>
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isRTL ? "اتصل بنا" : "Contact Us"}
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              {isRTL 
                ? "نحن هنا للمساعدة! تواصل معنا لأي استفسارات أو تعليقات" 
                : "We're here to help! Reach out to us for any questions or feedback"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white dark:bg-gray-900 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                {isRTL ? "معلومات التواصل" : "Get in Touch"}
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {isRTL ? info.titleAr : info.titleEn}
                      </h3>
                      <p className="text-muted-foreground">
                        {isRTL ? info.valueAr : info.valueEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Call Buttons */}
              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-foreground mb-4">
                  {isRTL ? "اتصل بنا مباشرة" : "Call Us Directly"}
                </h3>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={() => window.open('tel:+15551234567')}
                  >
                    <Phone className="h-4 w-4" />
                    {isRTL ? "اتصال عادي" : "Regular Call"}
                    <span className="ml-auto text-muted-foreground">+1 (555) 123-4567</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={() => window.open('https://wa.me/15551234567')}
                  >
                    <span className="text-green-500">📱</span>
                    {isRTL ? "واتساب" : "WhatsApp"}
                    <span className="ml-auto text-muted-foreground">+1 (555) 123-4567</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {isRTL ? "أرسل لنا رسالة" : "Send Us a Message"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          {isRTL ? "الاسم" : "Name"} *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          required
                          placeholder={isRTL ? "اسمك الكامل" : "Your full name"}
                          className={isRTL ? "text-right" : ""}
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          {isRTL ? "رقم الهاتف" : "Phone Number"}
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder={isRTL ? "رقم هاتفك" : "Your phone number"}
                          className={isRTL ? "text-right" : ""}
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {isRTL ? "البريد الإلكتروني" : "Email"} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        placeholder={isRTL ? "بريدك الإلكتروني" : "Your email address"}
                        className={isRTL ? "text-right" : ""}
                        dir={isRTL ? "rtl" : "ltr"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {isRTL ? "الرسالة" : "Message"} *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        required
                        rows={5}
                        placeholder={isRTL 
                          ? "اكتب رسالتك هنا..."
                          : "Write your message here..."
                        }
                        className={isRTL ? "text-right" : ""}
                        dir={isRTL ? "rtl" : "ltr"}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gap-2" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          {isRTL ? "جاري الإرسال..." : "Sending..."}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {isRTL ? "إرسال الرسالة" : "Send Message"}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              {isRTL ? "موقعنا" : "Find Us"}
            </h2>
            
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isRTL ? "الخريطة التفاعلية" : "Interactive Map"}
                </h3>
                <p className="text-muted-foreground">
                  {isRTL 
                    ? "123 شارع القهوة، وسط المدينة"
                    : "123 Coffee Street, Downtown"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}