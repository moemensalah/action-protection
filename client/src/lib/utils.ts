import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // If it's already a full URL (starts with http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative URL starting with /uploads, make it absolute
  if (imageUrl.startsWith('/uploads/')) {
    return `${window.location.origin}${imageUrl}`;
  }
  
  // For any other relative URLs, return as is
  return imageUrl;
}