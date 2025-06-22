import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  isRTL?: boolean;
}

export function FileUpload({
  label,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5,
  className = "",
  isRTL = false
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync preview with value prop when it changes
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL 
          ? `حجم الملف كبير جداً. الحد الأقصى ${maxSize} ميجابايت`
          : `File size too large. Maximum ${maxSize}MB allowed`,
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يُسمح بملفات الصور فقط" : "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.url;
      
      setPreview(imageUrl);
      onChange(imageUrl);
      
      toast({
        title: isRTL ? "تم الرفع" : "Uploaded",
        description: isRTL ? "تم رفع الصورة بنجاح" : "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في رفع الصورة" : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className={isRTL ? "text-right block" : "text-left block"}>
        {label}
      </Label>
      
      <div className="space-y-3">
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Upload Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={isUploading}
          className={`w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
          ) : (
            <>
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-600">
                {isRTL ? "انقر لرفع صورة" : "Click to upload image"}
              </span>
              <span className="text-xs text-gray-400">
                {isRTL ? `حد أقصى ${maxSize} ميجابايت` : `Max ${maxSize}MB`}
              </span>
            </>
          )}
        </Button>
        
        {/* Preview */}
        {preview && (
          <div className="relative">
            <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <img 
                src={getImageUrl(preview)} 
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} h-6 w-6 p-0`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}