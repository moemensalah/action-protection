import React, { useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";
import { AdminLoading } from "@/components/ui/admin-loading";

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
        <AdminLoading />
      </div>
    );
  }

  const currentUser = user || loginUser;
  
  if (!isAuthenticated && !currentUser) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
}