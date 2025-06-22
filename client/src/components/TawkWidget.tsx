import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { WidgetSettings } from '@shared/schema';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export function TawkWidget() {
  const { data: tawkConfig } = useQuery<WidgetSettings>({
    queryKey: ["/api/widgets/tawk_chat"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Only load if widget is active and has valid configuration
    const settings = tawkConfig?.settings as { propertyId?: string; widgetId?: string } | undefined;
    if (!tawkConfig?.isActive || !settings?.propertyId || !settings?.widgetId) {
      return;
    }

    // Remove existing Tawk script if present
    const existingScript = document.getElementById('tawk-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Initialize Tawk API
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Create and inject the Tawk script
    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.async = true;
    script.src = `https://embed.tawk.to/${settings.propertyId!}/${settings.widgetId!}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Find the first script tag and insert before it
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById('tawk-script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
      
      // Clean up Tawk API
      if (window.Tawk_API) {
        try {
          window.Tawk_API.onLoad = function() {
            window.Tawk_API.hideWidget();
          };
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [tawkConfig]);

  return null; // This component doesn't render anything visible
}