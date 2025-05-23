'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { betslipStorage } from '@/lib/betslip-storage';

export function BetslipIndicator() {
  const [itemCount, setItemCount] = useState(0);

  const updateCount = () => {
    const items = betslipStorage.getItems();
    setItemCount(items.length);
  };

  useEffect(() => {
    updateCount();
    
    // Listen for betslip updates
    const handleBetslipUpdate = () => {
      updateCount();
    };

    window.addEventListener('betslipUpdated', handleBetslipUpdate);
    return () => window.removeEventListener('betslipUpdated', handleBetslipUpdate);
  }, []);

  if (itemCount === 0) {
    return null;
  }

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
    >
      {itemCount > 99 ? '99+' : itemCount}
    </Badge>
  );
} 