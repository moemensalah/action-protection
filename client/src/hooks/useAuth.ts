import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: authData, isLoading } = useQuery({
    queryKey: ["/api/auth/local/user"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime in v5)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return {
    user: authData,
    isLoading,
    isAuthenticated: !!authData,
  };
}