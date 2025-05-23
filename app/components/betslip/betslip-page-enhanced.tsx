'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart, TrendingUp, Coins } from 'lucide-react';
import { betslipStorage, BetslipItem, BetslipSummary } from '@/lib/betslip-storage';
import { CreateParlayForm } from '@/app/components/parlays/create-parlay-form';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function BetslipPageEnhanced() {
  const [betslip, setBetslip] = useState<BetslipSummary>({ items: [], totalOdds: 0 });
  const [betAmount, setBetAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load betslip data
  const loadBetslip = () => {
    const coins = betAmount ? parseFloat(betAmount) : undefined;
    const summary = betslipStorage.getSummary(coins);
    setBetslip(summary);
    setIsLoading(false);
  };

  useEffect(() => {
    loadBetslip();
    
    // Listen for betslip updates
    const handleBetslipUpdate = () => {
      loadBetslip();
    };

    window.addEventListener('betslipUpdated', handleBetslipUpdate);
    return () => window.removeEventListener('betslipUpdated', handleBetslipUpdate);
  }, [betAmount]);

  const handleRemoveItem = (itemId: string) => {
    betslipStorage.removeItem(itemId);
    loadBetslip();
    window.dispatchEvent(new CustomEvent('betslipUpdated'));
  };

  const handleClearBetslip = () => {
    betslipStorage.clear();
    loadBetslip();
    window.dispatchEvent(new CustomEvent('betslipUpdated'));
  };

  const handleBetAmountChange = (value: string) => {
    setBetAmount(value);
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (betslip.items.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Betslip</h1>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your betslip is empty</h2>
            <p className="text-muted-foreground mb-4">
              Add props to your betslip by clicking the "Add" buttons on prop lines
            </p>
            <Button asChild>
              <a href="/props">Browse Props</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const numericBetAmount = betAmount ? parseFloat(betAmount) : 0;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Betslip</h1>
          <Badge variant="secondary">{betslip.items.length} bet{betslip.items.length !== 1 ? 's' : ''}</Badge>
        </div>
        
        {betslip.items.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearBetslip}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Betslip Items */}
        <div className="lg:col-span-3 space-y-4">
          {betslip.items.map((item) => (
            <Card key={item.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {item.propDescription}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Added by {item.createdBy} • {formatDistanceToNow(new Date(item.addedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.line}</span>
                    </div>
                    <Badge variant={item.selection === 'over' ? 'default' : 'secondary'}>
                      {item.selection.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-mono",
                      item.odds > 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {formatOdds(item.odds)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bet Summary and Parlay Creation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bet Summary */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Bet Summary
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bet-amount">Bet Amount (Coins)</Label>
                <Input
                  id="bet-amount"
                  type="number"
                  placeholder="Enter amount..."
                  value={betAmount}
                  onChange={(e) => handleBetAmountChange(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Number of Bets:</span>
                  <span className="font-medium">{betslip.items.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Odds:</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-mono",
                      betslip.totalOdds > 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {formatOdds(betslip.totalOdds)}
                  </Badge>
                </div>
                
                {betAmount && parseFloat(betAmount) > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Bet Amount:</span>
                      <span className="font-medium">{parseFloat(betAmount).toFixed(2)} coins</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Potential Payout:</span>
                      <span className="text-green-600">
                        {betslip.expectedPayout?.toFixed(2)} coins
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Potential Profit:</span>
                      <span className="text-green-600">
                        +{(betslip.expectedPayout! - parseFloat(betAmount)).toFixed(2)} coins
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Create Parlay Form */}
          {numericBetAmount > 0 && (
            <CreateParlayForm 
              betAmount={numericBetAmount}
              onSuccess={() => {
                setBetAmount('');
                // Redirect will be handled by the form component
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
} 