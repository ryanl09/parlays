'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Loader2 } from 'lucide-react';
import { cashOutParlay } from '@/app/actions/parlays/cash-out-parlay';
import { toast } from 'sonner';

interface CashOutButtonProps {
  parlayId: string;
  estimatedCashOut: number;
  className?: string;
}

export function CashOutButton({ parlayId, estimatedCashOut, className }: CashOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleCashOut = () => {
    startTransition(async () => {
      try {
        const result = await cashOutParlay(parlayId);
        
        if (result.success) {
          toast.success(result.message, {
            duration: 5000,
            description: `Received ${result.cashOutAmount} coins`
          });
        } else {
          toast.error('Cash out failed', {
            description: result.error
          });
        }
      } catch (error) {
        console.error('Error cashing out:', error);
        toast.error('Cash out failed', {
          description: 'An unexpected error occurred'
        });
      }
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Cash out value:</span>
        <Badge variant="outline" className="font-mono">
          ~{estimatedCashOut.toLocaleString()} coins
        </Badge>
      </div>
      
      <Button
        onClick={handleCashOut}
        disabled={isPending}
        variant="outline"
        size="sm"
        className="w-full gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <DollarSign className="h-4 w-4" />
        )}
        {isPending ? 'Cashing out...' : 'Cash Out'}
      </Button>
    </div>
  );
} 