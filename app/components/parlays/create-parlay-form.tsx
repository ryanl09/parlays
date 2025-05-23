'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trophy, AlertCircle, CheckCircle } from 'lucide-react';
import { createParlay } from '@/app/actions/parlays/create-parlay';
import { betslipStorage } from '@/lib/betslip-storage';
import { cn } from '@/lib/utils';

interface CreateParlayFormProps {
  betAmount: number;
  onSuccess?: () => void;
  className?: string;
}

export function CreateParlayForm({ betAmount, onSuccess, className }: CreateParlayFormProps) {
  const [title, setTitle] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (betAmount <= 0) {
      setResult({ success: false, error: 'Please enter a valid bet amount' });
      return;
    }

    const betslipItems = betslipStorage.getItems().map(item => ({
      propId: item.propId,
      lineId: item.lineId,
      selection: item.selection as 'over' | 'under',
      odds: item.odds
    }));

    if (betslipItems.length === 0) {
      setResult({ success: false, error: 'No bets in your betslip' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await createParlay({
          title: title.trim() || undefined,
          coins: betAmount,
          betslipItems
        });

        if (response.success) {
          setResult({ success: true, message: response.message });
          // Clear betslip after successful parlay creation
          betslipStorage.clear();
          // Notify other components
          window.dispatchEvent(new CustomEvent('betslipUpdated'));
          window.dispatchEvent(new CustomEvent('coinsUpdated'));
          
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setResult({ success: false, error: response.error });
        }
      } catch (error) {
        setResult({ 
          success: false, 
          error: error instanceof Error ? error.message : 'An unexpected error occurred' 
        });
      }
    });
  };

  if (result?.success) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">Parlay Created!</h3>
              <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
            </div>
            <Button asChild>
              <a href="/parlays">View My Parlays</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Create Parlay
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parlay-title">Parlay Name (Optional)</Label>
            <Input
              id="parlay-title"
              type="text"
              placeholder="Enter a name for your parlay..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Bet Amount</Label>
            <div className="flex items-center gap-2">
              <span className="font-medium">{betAmount.toFixed(2)} coins</span>
              <span className="text-sm text-muted-foreground">
                (Set in the bet summary above)
              </span>
            </div>
          </div>

          {result?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isPending || betAmount <= 0}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Parlay...
              </>
            ) : (
              'Create Parlay'
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            This will deduct {betAmount.toFixed(2)} coins from your balance
          </p>
        </form>
      </CardContent>
    </Card>
  );
} 