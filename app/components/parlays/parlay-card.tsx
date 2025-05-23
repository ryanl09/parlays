'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Coins, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';
import { CountdownTimer } from './countdown-timer';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { TalliesSection } from '@/app/components/tallies/tallies-section';

interface Tally {
  id: string;
  propId: string;
  created: Date;
  createdBy: {
    id: string;
    name: string;
  };
}

interface ParlayLeg {
  prop_option_id: string;
  is_over: boolean;
  odds: number;
  prop_options: {
    id: string;
    line: number;
    odds_over: number;
    odds_under: number;
    props: {
      id: string;
      description: string;
      end: Date;
      ev: number;
      users_props_created_byTousers: {
        id: string;
        name: string;
      };
      tallies: Tally[];
      tallyCount: number;
    };
  };
}

interface ParlayCardProps {
  parlay: {
    id: string;
    name: string | null;
    coins: number;
    created: Date;
    parlay_props: ParlayLeg[];
  };
  className?: string;
}

export function ParlayCard({ parlay, className }: ParlayCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate the maximum end time from all props
  const maxEndTime = parlay.parlay_props.reduce((maxDate, leg) => {
    const endTime = new Date(leg.prop_options.props.end);
    return endTime > maxDate ? endTime : maxDate;
  }, new Date(0));

  // Calculate total odds using the locked-in odds from when the parlay was created
  const totalOdds = parlay.parlay_props.reduce((total, leg) => {
    const odds = leg.odds; // Use the odds that were locked in when the parlay was created
    // Convert American odds to decimal and multiply
    const decimal = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
    return total * decimal;
  }, 1);

  const formatOdds = (americanOdds: number) => {
    return americanOdds > 0 ? `+${americanOdds}` : `${americanOdds}`;
  };

  const potentialPayout = Math.round(parlay.coins * (totalOdds - 1));

  return (
    <Card className={cn("w-full transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">
                {parlay.name || `Parlay ${parlay.id.slice(0, 8)}`}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {parlay.parlay_props.length} legs
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDistanceToNow(new Date(parlay.created), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <Badge variant="outline" className="font-mono text-base">
              {parlay.coins.toLocaleString()} coins
            </Badge>
          </div>
          
          <CountdownTimer endTime={maxEndTime} />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Potential payout:</span>
          <Badge variant="default" className="font-mono">
            +{potentialPayout.toLocaleString()} coins
          </Badge>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          <div className="space-y-3">
            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              Parlay Legs
            </h4>
            
            {parlay.parlay_props.map((leg, index) => {
              const odds = leg.odds; // Use the odds that were locked in when the parlay was created
              const lineValue = leg.prop_options.line;
              
              return (
                <div key={leg.prop_option_id} className="space-y-2">
                  <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={leg.is_over ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {leg.is_over ? "OVER" : "UNDER"}
                        </Badge>
                        <span className="font-medium">{lineValue}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {leg.prop_options.props.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>by {leg.prop_options.props.users_props_created_byTousers.name}</span>
                        <span>•</span>
                        <span>Ends {formatDistanceToNow(new Date(leg.prop_options.props.end), { addSuffix: true })}</span>
                      </div>
                      
                      {/* Tallies for this prop */}
                      <div className="mt-2 pt-2 border-t border-muted/50">
                        <TalliesSection 
                          propId={leg.prop_options.props.id}
                          initialTallies={leg.prop_options.props.tallies}
                          initialCount={leg.prop_options.props.tallyCount}
                        />
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-mono ml-3",
                        odds > 0 ? "text-green-600 border-green-300" : "text-red-600 border-red-300"
                      )}
                    >
                      {formatOdds(odds)}
                    </Badge>
                  </div>
                  
                  {index < parlay.parlay_props.length - 1 && (
                    <div className="flex justify-center">
                      <div className="text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
                        AND
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Combined Odds:</span>
                <Badge variant="outline" className="font-mono">
                  {totalOdds.toFixed(2)}x
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
} 