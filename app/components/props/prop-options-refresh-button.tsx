'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PropOptionsRefreshButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isPending}
      variant="ghost"
      size="sm"
      className="gap-1 text-xs h-7"
    >
      <RefreshCw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
      {isPending ? 'Refreshing lines...' : 'Refresh lines'}
    </Button>
  );
} 