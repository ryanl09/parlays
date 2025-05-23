'use client';

import { useEffect } from 'react';
import { resolveParlays } from '@/app/actions/parlays/resolve-parlays';
import { toast } from 'sonner';

export function ParlayResolver() {
  useEffect(() => {
    const checkParlays = async () => {
      // Check if we've already resolved parlays in this session
      const lastCheck = sessionStorage.getItem('parlayLastCheck');
      const now = Date.now();
      
      // Only check once every 5 minutes to avoid excessive API calls
      if (lastCheck && (now - parseInt(lastCheck)) < 5 * 60 * 1000) {
        return;
      }

      try {
        const result = await resolveParlays();
        
        if (result.success && result.resolvedCount && result.resolvedCount > 0) {
          toast.success(result.message, {
            duration: 5000,
            description: `You won ${result.totalPayout} coins!`
          });
        }
        
        // Update last check time
        sessionStorage.setItem('parlayLastCheck', now.toString());
      } catch (error) {
        console.error('Error checking parlays:', error);
        // Still update last check time to avoid repeated failures
        sessionStorage.setItem('parlayLastCheck', now.toString());
      }
    };

    // Check parlays after a short delay to avoid blocking initial render
    const timeoutId = setTimeout(checkParlays, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // This component doesn't render anything visible
  return null;
} 