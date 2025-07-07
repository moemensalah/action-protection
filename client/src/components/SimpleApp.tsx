import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";

export function SimpleApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-white p-8">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Action Protection</h1>
        <p className="text-lg text-gray-700 mb-4">Vehicle Protection Services in Kuwait</p>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-blue-800">Simple app is working correctly!</p>
          <p className="text-sm text-gray-600 mt-2">Server connection successful</p>
        </div>
      </div>
    </QueryClientProvider>
  );
}