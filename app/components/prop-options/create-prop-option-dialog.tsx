'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, ArrowLeftRightIcon, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createPropOption } from "@/app/actions/prop-options/create-prop-option";

type PropOptionValues = {
  line: string;
  overOdds: string;
  underOdds: string;
};

type CreatePropOptionDialogProps = {
  className?: string;
  propId: string;
  propEV: number;
  onSuccess?: () => void;
  onPropOptionAdded?: (newOption: { id: string; line: number; oddsOver: number; oddsUnder: number }) => void;
};

export const CreatePropOptionDialog = ({ 
  className = '',
  propId,
  propEV,
  onSuccess,
  onPropOptionAdded
}: CreatePropOptionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<PropOptionValues>({
    line: '',
    overOdds: '',
    underOdds: ''
  });
  const [isLineModified, setIsLineModified] = useState(false);
  const [isOverOddsModified, setIsOverOddsModified] = useState(false);
  const [isUnderOddsModified, setIsUnderOddsModified] = useState(false);

  const calculateOddsFromLine = (line: string): { over: string, under: string } => {
    if (!line || isNaN(parseFloat(line))) return { over: '', under: '' };
    
    const lineValue = parseFloat(line);
    const ev = propEV; // Use the passed EV
    
    // Calculate probability based on distance from EV
    let overProb, underProb;
    
    if (lineValue === ev) {
      // When line equals EV, 50/50 odds
      overProb = 0.5;
      underProb = 0.5;
    } else {
      // Simple linear probability shift based on distance from EV
      const distance = lineValue - ev;
      const shift = Math.min(0.4, Math.abs(distance) / ev * 0.8);
      
      if (lineValue < ev) {
        // Line below EV, over more likely
        overProb = 0.5 + shift;
        underProb = 0.5 - shift;
      } else {
        // Line above EV, under more likely
        overProb = 0.5 - shift;
        underProb = 0.5 + shift;
      }
    }
    
    // Convert probability to American odds
    const probToOdds = (prob: number): number => {
      if (prob >= 0.5) {
        // Favorite (negative odds)
        return Math.round(-100 * prob / (1 - prob));
      } else {
        // Underdog (positive odds)  
        let odds = Math.round(100 * (1 - prob) / prob);
        
        // Apply house edge to positive odds (reduce by 5-8%)
        const houseEdgeReduction = 0.06; // 6% house edge
        odds = Math.round(odds * (1 - houseEdgeReduction));
        
        return odds;
      }
    };
    
    let overOdds = probToOdds(overProb);
    let underOdds = probToOdds(underProb);
    
    // Round to nearest 5
    overOdds = Math.round(overOdds / 5) * 5;
    underOdds = Math.round(underOdds / 5) * 5;
    
    return { 
      over: overOdds > 0 ? `+${overOdds}` : overOdds.toString(),
      under: underOdds > 0 ? `+${underOdds}` : underOdds.toString()
    };
  };

  const calculateLineFromOdds = (oddsString: string, isOver: boolean): string => {
    if (!oddsString) return '';
        
    const oddsValue = parseInt(oddsString.replace('+', ''));
    if (isNaN(oddsValue)) return '';
    
    // Convert odds to implied probability using your formula
    let impliedProb: number;
    if (oddsValue > 0) {
      // Positive odds: 100 / (odds + 100)
      impliedProb = 100 / (oddsValue + 100);
    } else {
      // Negative odds: |odds| / (|odds| + 100)  
      impliedProb = Math.abs(oddsValue) / (Math.abs(oddsValue) + 100);
    }
    
    const ev = propEV;
    
    // Calculate shift from 50%
    const shift = Math.abs(impliedProb - 0.5);
    
    // Convert shift back to distance from EV
    const distance = (shift / 0.8) * ev;
    
    let lineValue;
    if (isOver) {
      if (impliedProb > 0.5) {
        // Over is favored, line below EV
        lineValue = ev - distance;
      } else {
        // Over is underdog, line above EV
        lineValue = ev + distance;
      }
    } else {
      if (impliedProb > 0.5) {
        // Under is favored, line above EV
        lineValue = ev + distance;
      } else {
        // Under is underdog, line below EV
        lineValue = ev - distance;
      }
    }
    
    // Round to nearest 0.5
    const line = Math.round(lineValue * 2) / 2;
    return line.toFixed(1);
  };

  const calculateComplementOdds = (oddsString: string): string => {
    if (!oddsString) return '';
    
    const isOver = true;
    const line = calculateLineFromOdds(oddsString, isOver);
    if (!line) return '';
    
    const { under } = calculateOddsFromLine(line);
    return under;
  };

  useEffect(() => {
    if (isLineModified && values.line) {
      const { over, under } = calculateOddsFromLine(values.line);
      setValues(prev => ({ ...prev, overOdds: over, underOdds: under }));
      setIsLineModified(false);
    }
  }, [values.line, isLineModified]);

  useEffect(() => {
    if (isOverOddsModified && values.overOdds) {
      const calculatedLine = calculateLineFromOdds(values.overOdds, true);
      const calculatedUnderOdds = calculateComplementOdds(values.overOdds);
      setValues(prev => ({ 
        ...prev, 
        line: calculatedLine,
        underOdds: calculatedUnderOdds
      }));
      setIsOverOddsModified(false);
    }
  }, [values.overOdds, isOverOddsModified]);

  useEffect(() => {
    if (isUnderOddsModified && values.underOdds) {
      const calculatedLine = calculateLineFromOdds(values.underOdds, false);
      const calculatedOverOdds = calculateComplementOdds(values.underOdds);
      setValues(prev => ({ 
        ...prev, 
        line: calculatedLine,
        overOdds: calculatedOverOdds 
      }));
      setIsUnderOddsModified(false);
    }
  }, [values.underOdds, isUnderOddsModified]);

  const handleLineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValues(prev => ({ ...prev, line: value }));
    setIsLineModified(true);
  };

  const handleOverOddsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^-+\d]/g, '');
    setValues(prev => ({ ...prev, overOdds: value }));
    setIsOverOddsModified(true);
  };

  const handleUnderOddsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^-+\d]/g, '');
    setValues(prev => ({ ...prev, underOdds: value }));
    setIsUnderOddsModified(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!values.line.endsWith('.5')) {
      toast.error("Line must end with .5");
      return;
    }
    
    if (!values.overOdds || isNaN(parseInt(values.overOdds.replace('+', '')))) {
      toast.error("Please enter valid over odds");
      return;
    }

    if (!values.underOdds || isNaN(parseInt(values.underOdds.replace('+', '')))) {
      toast.error("Please enter valid under odds");
      return;
    }

    try {
      const result = await createPropOption({
        propId,
        line: parseFloat(values.line),
        oddsOver: parseInt(values.overOdds.replace('+', '')),
        oddsUnder: parseInt(values.underOdds.replace('+', ''))
      });
      
      if (onPropOptionAdded && result.success) {
        onPropOptionAdded({
          id: result.id,
          line: parseFloat(values.line),
          oddsOver: parseInt(values.overOdds.replace('+', '')),
          oddsUnder: parseInt(values.underOdds.replace('+', ''))
        });
      }
      
      toast.success("Prop option created successfully");
      setValues({ line: '', overOdds: '', underOdds: '' });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Failed to create prop option");
    }
  };

  const formatLine = (value: string): string => {
    if (!value) return '';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    const rounded = Math.round(numValue * 2) / 2;
    return rounded.toFixed(1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='default' className={className}>
          <PlusIcon className="mr-2 h-4 w-4" />
          <span>Add Line</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Prop Line</DialogTitle>
          <DialogDescription>
            Create a new over/under line with corresponding odds.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="line" className="text-right">Line</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The over/under value (must end with .5)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                id="line" 
                value={values.line} 
                onChange={handleLineChange}
                onBlur={() => setValues(prev => ({ ...prev, line: formatLine(prev.line) }))}
                placeholder="45.5"
                type="number"
                step="0.5"
              />
            </div>

            <div className="flex justify-center py-2">
              <ArrowLeftRightIcon className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="overOdds" className="text-right">Over Odds</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>American odds format (e.g. +150 or -200)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                id="overOdds" 
                value={values.overOdds} 
                onChange={handleOverOddsChange}
                placeholder="-110"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="underOdds" className="text-right">Under Odds</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>American odds format (e.g. +150 or -200)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                id="underOdds" 
                value={values.underOdds} 
                onChange={handleUnderOddsChange}
                placeholder="-110"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">Create Line</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

