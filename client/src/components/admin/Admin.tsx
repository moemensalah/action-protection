import React, { useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";

export function Admin() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [loginUser, setLoginUser] = useState<any>(null);

  const handleLogin = (userData: any) => {
    setLoginUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/local/logout", {
        method: "POST",
        credentials: "include"
      });
      setLoginUser(null);
      // Force a page reload to clear all state
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      setLoginUser(null);
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const currentUser = user || loginUser;
  
  if (!isAuthenticated && !currentUser) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
}