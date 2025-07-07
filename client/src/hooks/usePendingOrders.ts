import { useQuery } from "@tanstack/react-query";

export function usePendingOrders() {
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["/api/admin/orders/pending-count"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    pendingCount,
    hasPendingOrders: pendingCount > 0
  };
}