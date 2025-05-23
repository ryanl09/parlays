'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { addTally } from '@/app/actions/tallies/add-tally';

interface AddTallyButtonProps {
  propId: string;
  onTallyAdded?: () => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function AddTallyButton({ 
  propId, 
  onTallyAdded, 
  size = 'sm', 
  variant = 'outline' 
}: AddTallyButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleAddTally = () => {
    startTransition(async () => {
      try {
        const result = await addTally(propId);
        if (result.success && onTallyAdded) {
          onTallyAdded();
        }
      } catch (error) {
        console.error('Error adding tally:', error);
      }
    });
  };

  return (
    <Button
      onClick={handleAddTally}
      disabled={isPending}
      size={size}
      variant={variant}
      className="flex items-center gap-1"
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Plus className="h-3 w-3" />
      )}
      <span className="text-xs">Add Tally</span>
    </Button>
  );
} 