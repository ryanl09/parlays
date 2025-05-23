'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import { betslipStorage } from '@/lib/betslip-storage';
import { cn } from '@/lib/utils';

interface AddToBetslipButtonProps {
  propId: string;
  propDescription: string;
  lineId: string;
  line: number;
  selection: 'over' | 'under';
  odds: number;
  createdBy: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function AddToBetslipButton({
  propId,
  propDescription,
  lineId,
  line,
  selection,
  odds,
  createdBy,
  className,
  size = 'sm',
  variant = 'outline',
}: AddToBetslipButtonProps) {
  const [isAdded, setIsAdded] = useState(() => 
    betslipStorage.hasItem(propId, lineId, selection)
  );
  const [isDisabled, setIsDisabled] = useState(false);

  const updateButtonState = () => {
    const isCurrentItemAdded = betslipStorage.hasItem(propId, lineId, selection);
    const hasPropItems = betslipStorage.hasPropItems(propId);
    
    setIsAdded(isCurrentItemAdded);
    // Disable if prop has items AND this specific item is not the one added
    setIsDisabled(hasPropItems && !isCurrentItemAdded);
  };

  useEffect(() => {
    updateButtonState();
    
    // Listen for betslip updates
    const handleBetslipUpdate = () => {
      updateButtonState();
    };

    window.addEventListener('betslipUpdated', handleBetslipUpdate);
    return () => window.removeEventListener('betslipUpdated', handleBetslipUpdate);
  }, [propId, lineId, selection]);

  const handleAddToBetslip = () => {
    if (isAdded) {
      // Remove from betslip
      const itemId = `${propId}-${lineId}-${selection}`;
      betslipStorage.removeItem(itemId);
    } else {
      // Add to betslip
      betslipStorage.addItem({
        propId,
        propDescription,
        lineId,
        line,
        selection,
        odds,
        createdBy,
      });
    }

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('betslipUpdated'));
  };

  return (
    <Button
      onClick={handleAddToBetslip}
      size={size}
      variant={isAdded ? 'default' : variant}
      disabled={isDisabled}
      className={cn(
        'transition-all',
        isAdded && 'bg-green-600 hover:bg-green-700',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isAdded ? (
        <>
          <Check className="h-3 w-3" />
          Added
        </>
      ) : (
        <>
          <Plus className="h-3 w-3" />
          {selection === 'over' ? 'O' : 'U'} {odds > 0 ? '+' : ''}{odds}
        </>
      )}
    </Button>
  );
} 