'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Plus, Hash } from 'lucide-react';
import { TallyItem } from '@/app/components/tallies/tally-item';
import { AddTallyButton } from '@/app/components/tallies/add-tally-button';
import { getPropTallies } from '@/app/actions/tallies/get-prop-tallies';

interface Tally {
  id: string;
  propId: string;
  created: Date;
  createdBy: {
    id: string;
    name: string;
  };
}

interface TalliesSectionProps {
  propId: string;
  initialTallies?: Tally[];
  initialCount?: number;
}

export function TalliesSection({ propId, initialTallies = [], initialCount = 0 }: TalliesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tallies, setTallies] = useState<Tally[]>(initialTallies);
  const [tallyCount, setTallyCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const loadTallies = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await getPropTallies(propId);
      if (result.success) {
        setTallies(result.tallies);
        setTallyCount(result.tallies.length);
      }
    } catch (error) {
      console.error('Error loading tallies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTallyAdded = () => {
    // Reload tallies when a new one is added
    loadTallies();
  };

  const handleTallyDeleted = () => {
    // Reload tallies when one is deleted
    loadTallies();
  };

  // Load tallies when section is first opened
  useEffect(() => {
    if (isOpen && tallies.length === 0) {
      loadTallies();
    }
  }, [isOpen]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between py-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 h-auto">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tallies</span>
              <Badge variant="secondary" className="text-xs">
                {tallyCount}
              </Badge>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <AddTallyButton propId={propId} onTallyAdded={handleTallyAdded} />
      </div>
      
      <CollapsibleContent className="space-y-2">
        {isLoading ? (
          <div className="py-4">
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ) : tallies.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No tallies yet. Be the first to add one!
          </div>
        ) : (
          <div className="space-y-1">
            {tallies.map((tally) => (
              <TallyItem
                key={tally.id}
                tally={tally}
                onDeleted={handleTallyDeleted}
              />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
} 