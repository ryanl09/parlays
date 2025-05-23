'use client';

import { PropOptionClient } from "@/app/components/prop-options/prop-option-client";
import { AddToBetslipButton } from "@/app/components/betslip/add-to-betslip-button";
import { Avatar } from "@/components/user/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow, format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { CalendarIcon, Coins, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { TalliesSection } from "@/app/components/tallies/tallies-section";
import { PropOptionsRefreshButton } from "./prop-options-refresh-button";

type PropOption = {
  id: string;
  line: number; // Converted from Decimal in getProps action
  odds_over: number;
  odds_under: number;
  created: Date;
  users_prop_options_created_byTousers: {
    id: string;
    name: string | null;
  };
};

type Tally = {
  id: string;
  propId: string;
  created: Date;
  createdBy: {
    id: string;
    name: string;
  };
};

type Prop = {
  id: string;
  description: string;
  ev: number; // Converted from Decimal in getProps action
  end: Date;
  created: Date;
  users_props_created_byTousers: {
    id: string;
    name: string | null;
  };
  prop_options: PropOption[];
  tallies: Tally[];
  tallyCount: number;
};

interface PropsListClientProps {
  initialProps: Prop[];
  currentUser: {
    id: string;
    name: string | null;
  };
  onRefreshHandler?: (refreshFn: (props: Prop[]) => void) => void;
}

export function PropsListClient({ initialProps, currentUser, onRefreshHandler }: PropsListClientProps) {
  const [props, setProps] = useState<Prop[]>(initialProps);

  // Update props when initialProps changes (e.g., when search params change)
  useEffect(() => {
    setProps(initialProps);
  }, [initialProps]);

  // Provide refresh handler to parent component
  useEffect(() => {
    if (onRefreshHandler) {
      onRefreshHandler(setProps);
    }
  }, [onRefreshHandler]);

  const handlePropOptionAdded = (propId: string, newOption: { id: string; line: number; oddsOver: number; oddsUnder: number; }) => {
    // Convert the simple callback object to the full PropOption type
    const fullPropOption: PropOption = {
      id: newOption.id,
      line: newOption.line,
      odds_over: newOption.oddsOver,
      odds_under: newOption.oddsUnder,
      created: new Date(),
      users_prop_options_created_byTousers: {
        id: currentUser.id,
        name: currentUser.name
      }
    };

    setProps(prevProps => 
      prevProps.map(prop => 
        prop.id === propId 
          ? { ...prop, prop_options: [...prop.prop_options, fullPropOption] }
          : prop
      )
    );
  };

  // Current time for countdown calculations
  const now = new Date();

  if (!props || props.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg 
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-6"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            fill="#fee2e2"
            stroke="#ef4444"
            strokeWidth="1.5"
          />
          <path
            d="M9 16C9 16 10.5 14 12 14C13.5 14 15 16 15 16"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M9 10L9.01 10"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M15 10L15.01 10"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <h2 className="text-xl font-semibold text-center">No props have been created</h2>
        <p className="text-muted-foreground mt-2 text-center">Create a new prop to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      {props.map((prop) => {
        const creator = prop.users_props_created_byTousers;
        const startDate = new Date(prop.created);
        const endDate = new Date(prop.end);
        
        // Calculate countdown (time left until end date)
        const isExpired = now >= endDate;
        const daysLeft = Math.max(0, differenceInDays(endDate, now));
        const hoursLeft = Math.max(0, differenceInHours(endDate, now) % 24);
        const minutesLeft = Math.max(0, differenceInMinutes(endDate, now) % 60);
        const durationStr = isExpired ? "0d 0h 0m" : `${daysLeft}d ${hoursLeft}h ${minutesLeft}m`;
        
        return (
          <Card key={prop.id} className="overflow-hidden hover:shadow-md transition-shadow relative">
            {/* Status badge */}
            <div className="absolute top-2 right-2">
              <Badge variant={"default"} className={cn(isExpired ? "bg-destructive/50 text-destructive-foreground" : "bg-green-500")}>
                {isExpired ? "Closed" : "Open"}
              </Badge>
            </div>
            
            <CardHeader className="pb-3 flex flex-row items-center gap-3">
              <Avatar name={creator.name || ''} />
              <div>
                <p className="font-medium">{creator.name}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDistanceToNow(startDate, { addSuffix: true })}
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <h2 className="text-lg font-semibold mb-3">{prop.description}</h2>
              
              <div className="flex flex-col space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <span>{format(startDate, 'MMM d, yyyy')}</span>
                  
                    <span> - </span>
                    
                    <div className="flex items-center gap-1">
                      <span>{format(endDate, 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Remaining:</span>
                    <Badge variant="outline" className="font-mono">{durationStr}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center px-3">
                  <span className="text-sm font-medium">Lines</span>
                  <PropOptionsRefreshButton />
                  <span className="text-sm font-medium">Under</span>
                  <span className="text-sm font-medium">Over</span>
                </div>
                
                {prop.prop_options.length === 0 ? (
                  <div className="py-2 text-sm text-muted-foreground">
                    No lines have been added
                  </div>
                ) : (
                  prop.prop_options.map((option) => (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-muted-foreground" />
                          <span>{option.line.toString()}</span>
                        </div>
                        <AddToBetslipButton
                          propId={prop.id}
                          propDescription={prop.description}
                          lineId={option.id}
                          line={Number(option.line)}
                          selection="under"
                          odds={option.odds_under}
                          createdBy={option.users_prop_options_created_byTousers.name || 'Unknown'}
                        />
                        <AddToBetslipButton
                          propId={prop.id}
                          propDescription={prop.description}
                          lineId={option.id}
                          line={Number(option.line)}
                          selection="over"
                          odds={option.odds_over}
                          createdBy={option.users_prop_options_created_byTousers.name || 'Unknown'}
                        />
                      </div>
                      
                      <div className="px-3 pb-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Avatar name={option.users_prop_options_created_byTousers.name || ''} size="sm" />
                          <span>Added by {option.users_prop_options_created_byTousers.name}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(option.created), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {!isExpired && (
                  <PropOptionClient
                    className="mt-3 w-full"
                    propId={prop.id}
                    propEV={Number(prop.ev)}
                    onPropOptionAdded={(newOption) => handlePropOptionAdded(prop.id, newOption)}
                  />
                )}
                
                {/* Tallies Section */}
                <div className="mt-4 pt-4 border-t border-muted">
                  <TalliesSection 
                    propId={prop.id}
                    initialTallies={prop.tallies}
                    initialCount={prop.tallyCount}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  );
} 