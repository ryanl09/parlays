'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ParlayProgressBarProps {
  tallies: number;
  line: number;
  isOver: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ParlayProgressBar({ tallies, line, isOver, className, size = 'md' }: ParlayProgressBarProps) {
  // Calculate progress percentage
  let progress = 0;
  let isWinning = false;
  
  if (line > 0) {
    if (isOver) {
      // For over bets, progress toward line+1 (need to exceed line)
      progress = Math.min(100, (tallies / (line + 1)) * 100);
      isWinning = tallies > line;
    } else {
      // For under bets, show how "safe" they are (distance from line)
      // Start at 100% and decrease as tallies approach line
      progress = Math.max(0, ((line - tallies) / line) * 100);
      isWinning = tallies < line;
    }
  }

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {tallies} / {line} {isOver ? '(need >)' : '(need <)'}
        </span>
        <span className={cn(
          'font-medium',
          isWinning ? 'text-green-600' : 'text-muted-foreground'
        )}>
          {isWinning ? '✓ Winning' : 'Pending'}
        </span>
      </div>
      
      <div 
        className={cn(
          'w-full bg-muted rounded-full transition-all duration-300',
          heightClasses[size]
        )}
      >
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isWinning 
              ? 'bg-green-500' 
              : progress > 80 
                ? 'bg-yellow-500' 
                : 'bg-blue-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
} 