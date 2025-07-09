#!/bin/bash

# ========================================================================
# Fix Production Admin Login Issue
# ========================================================================
# This script applies the admin login fix to the production server
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing Production Admin Login..."

# Navigate to project directory
cd $PROJECT_DIR

# Stop PM2 processes
echo "1. Stopping PM2 processes..."
sudo -u $APP_USER pm2 stop all || true

# Apply the admin login fix to the production code
echo "2. Applying admin login fix..."

# Fix the AdminLogin.tsx component
sudo -u $APP_USER bash -c "cat > client/src/components/admin/AdminLogin.tsx << 'EOF'
import { useState } from \"react\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { Card, CardContent, CardHeader, CardTitle } from \"@/components/ui/card\";
import { useToast } from \"@/hooks/use-toast\";
import { useLanguage } from \"@/hooks/useLanguage\";
import { LogIn, Shield } from \"lucide-react\";

interface AdminLoginProps {
  onLogin: (user: any) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: \"\",
    password: \"\"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(\"/api/auth/admin/login\", {
        method: \"POST\",
        headers: { \"Content-Type\": \"application/json\" },
        credentials: \"include\",
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(\"Invalid credentials\");
      }

      const data = await response.json();
      
      if (data.user) {
        // Don't rely on localStorage, use server session only
        onLogin(data.user);
        toast({
          title: isRTL ? \"تم تسجيل الدخول\" : \"Login Successful\",
          description: isRTL ? \"مرحباً بك في لوحة التحكم\" : \"Welcome to admin panel\",
        });
      }
    } catch (error) {
      toast({
        title: isRTL ? \"خطأ في تسجيل الدخول\" : \"Login Error\",
        description: isRTL ? \"بيانات الدخول غير صحيحة\" : \"Invalid username or password\",
        variant: \"destructive\",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (type: \"admin\" | \"moderator\") => {
    const credentials = type === \"admin\" 
      ? { email: \"admin@actionprotection.com\", password: \"admin123456\" }
      : { email: \"haitham2@hmaserv.com\", password: \"securepass123\" };
    
    setFormData(credentials);
  };

  return (
    <div className=\"min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4\">
      <Card className=\"w-full max-w-md\">
        <CardHeader className=\"text-center\">
          <div className=\"mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-4\">
            <Shield className=\"h-6 w-6 text-amber-600 dark:text-amber-400\" />
          </div>
          <CardTitle className=\"text-2xl\">
            {isRTL ? \"لوحة التحكم\" : \"Admin Panel\"}
          </CardTitle>
          <p className=\"text-gray-600 dark:text-gray-400\">
            {isRTL ? \"تسجيل دخول المديرين والمشرفين\" : \"Administrator & Moderator Login\"}
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className=\"space-y-4\">
            <div>
              <Label htmlFor=\"email\">{isRTL ? \"البريد الإلكتروني\" : \"Email\"}</Label>
              <Input
                id=\"email\"
                type=\"email\"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder={isRTL ? \"أدخل البريد الإلكتروني\" : \"Enter your email\"}
                required
              />
            </div>
            
            <div>
              <Label htmlFor=\"password\">{isRTL ? \"كلمة المرور\" : \"Password\"}</Label>
              <Input
                id=\"password\"
                type=\"password\"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={isRTL ? \"أدخل كلمة المرور\" : \"Enter your password\"}
                required
              />
            </div>
            
            <Button type=\"submit\" className=\"w-full\" disabled={isLoading}>
              <LogIn className=\"h-4 w-4 mr-2\" />
              {isLoading 
                ? (isRTL ? \"جاري تسجيل الدخول...\" : \"Logging in...\")
                : (isRTL ? \"تسجيل الدخول\" : \"Login\")
              }
            </Button>
          </form>
          
          {import.meta.env.DEV && (
            <div className=\"mt-6 space-y-2\">
              <p className=\"text-sm text-gray-600 dark:text-gray-400 text-center\">
                {isRTL ? \"حسابات تجريبية:\" : \"Demo Accounts:\"}
              </p>
              <div className=\"grid grid-cols-1 gap-2\">
                <Button 
                  variant=\"outline\" 
                  size=\"sm\" 
                  onClick={() => handleDemoLogin(\"admin\")}
                  className=\"text-xs\"
                >
                  <Shield className=\"h-3 w-3 mr-2\" />
                  {isRTL ? \"مدير (admin@actionprotection.com)\" : \"Admin (admin@actionprotection.com)\"}
                </Button>
                <Button 
                  variant=\"outline\" 
                  size=\"sm\" 
                  onClick={() => handleDemoLogin(\"moderator\")}
                  className=\"text-xs\"
                >
                  <Shield className=\"h-3 w-3 mr-2\" />
                  {isRTL ? \"مشرف (moderator@actionprotection.com)\" : \"Moderator (moderator@actionprotection.com)\"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
EOF"

# Set correct permissions
echo "3. Setting permissions..."
chown -R $APP_USER:$APP_USER $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# Rebuild the application
echo "4. Rebuilding application..."
sudo -u $APP_USER npm run build

# Start PM2 processes
echo "5. Starting PM2 processes..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

# Wait for startup
echo "6. Waiting for application to start..."
sleep 10

# Test the admin login
echo "7. Testing admin login..."
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    > /tmp/login_test.json

# Check if login was successful
if grep -q "Admin login successful" /tmp/login_test.json; then
    echo "✅ Admin login test: SUCCESS"
else
    echo "❌ Admin login test: FAILED"
    cat /tmp/login_test.json
fi

# Check PM2 status
echo "8. PM2 Status:"
sudo -u $APP_USER pm2 list

echo ""
echo "🎉 Production admin login fix complete!"
echo ""
echo "Admin login credentials:"
echo "  Email: admin@actionprotection.com"
echo "  Password: admin123456"
echo "  URL: https://demox.actionprotectionkw.com/admin"
echo ""
echo "The fix has been applied to your production server!"