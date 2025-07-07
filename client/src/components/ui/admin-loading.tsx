import React from 'react';

interface AdminLoadingProps {
  className?: string;
}

export function AdminLoading({ className = "" }: AdminLoadingProps) {
  return (
    <div className={`flex justify-center p-8 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
    </div>
  );
}