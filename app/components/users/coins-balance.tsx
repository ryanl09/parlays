'use client';

import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getUserCoins } from '@/app/actions/users/get-user-coins';

export function CoinsBalance() {
  const [coins, setCoins] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCoins = async () => {
    try {
      setIsLoading(true);
      const userCoins = await getUserCoins();
      setCoins(userCoins);
    } catch (error) {
      console.error('Error loading coins:', error);
      setCoins(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoins();
    
    // Listen for parlay creation or other updates that might affect coin balance
    const handleCoinsUpdate = () => {
      loadCoins();
    };

    window.addEventListener('coinsUpdated', handleCoinsUpdate);
    return () => window.removeEventListener('coinsUpdated', handleCoinsUpdate);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (coins === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Coins className="h-5 w-5 text-yellow-500" />
      <Badge variant="outline" className="font-mono text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-700">
        {coins.toLocaleString()} coins
      </Badge>
    </div>
  );
} 