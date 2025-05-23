'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FlameIcon, SparkleIcon, ClockIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type PropsSortType = 'newest' | 'oldest' | 'popular';

interface PropsSortSelectorProps {
  defaultValue?: PropsSortType;
}

export const PropsSortSelector = ({ defaultValue }: PropsSortSelectorProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get('sortBy') as PropsSortType || defaultValue || 'newest';
  
  const handleSortChange = (value: PropsSortType) => {
    const params = new URLSearchParams(searchParams);
    
    params.set('sortBy', value);
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div className='space-y-2'>
      <Label>Sort by</Label>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort props" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">
            <div className="flex items-center gap-2">
              <SparkleIcon className="h-4 w-4" />
              <span>Newest</span>
            </div>
          </SelectItem>
          <SelectItem value="oldest">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span>Oldest</span>
            </div>
          </SelectItem>
          <SelectItem value="popular">
            <div className="flex items-center gap-2">
              <FlameIcon className="h-4 w-4" />
              <span>Popular</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};