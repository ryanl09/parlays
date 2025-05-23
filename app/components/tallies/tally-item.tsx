'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/user/avatar';
import { Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { deleteTally } from '@/app/actions/tallies/delete-tally';

interface Tally {
  id: string;
  propId: string;
  created: Date;
  createdBy: {
    id: string;
    name: string;
  };
}

interface TallyItemProps {
  tally: Tally;
  onDeleted?: () => void;
}

export function TallyItem({ tally, onDeleted }: TallyItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteTally(parseInt(tally.id));
        if (result.success && onDeleted) {
          onDeleted();
        }
      } catch (error) {
        console.error('Error deleting tally:', error);
      }
    });
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md">
      <div className="flex items-center gap-3">
        <Avatar name={tally.createdBy.name} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{tally.createdBy.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(tally.created), { addSuffix: true })}
          </span>
        </div>
      </div>
      
      <Button
        onClick={handleDelete}
        disabled={isPending}
        variant="ghost"
        size="sm"
        className="ml-auto h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
} 