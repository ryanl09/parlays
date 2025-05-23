'use server';

import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteTally(tallyId: number) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Use transaction to ensure consistency when updating odds
    await prisma.$transaction(async (tx) => {
      // First get the tally to ensure it exists and get the prop_id
      const tally = await tx.prop_points.findUnique({
        where: { id: tallyId }
      });

      if (!tally || !tally.active) {
        throw new Error('Tally not found or already deleted');
      }

      // Delete the tally (soft delete by setting active to false)
      await tx.prop_points.update({
        where: { id: tallyId },
        data: {
          active: false,
          modified: new Date(),
          modified_by: currentUser.id
        }
      });

      // Get the prop and its remaining tallies to recalculate odds
      const propWithTallies = await tx.props.findUnique({
        where: { id: tally.prop_id },
        include: {
          prop_points: {
            where: { active: true }
          },
          prop_options: {
            where: { active: true }
          }
        }
      });

      if (!propWithTallies) {
        throw new Error('Prop not found during odds calculation');
      }

      // Calculate new EV based on remaining tallies
      const currentTallies = propWithTallies.prop_points.length;
      const originalEV = Number(propWithTallies.ev);
      const propStart = new Date(propWithTallies.created);
      const propEnd = new Date(propWithTallies.end);
      const currentTime = new Date();
      
      // Calculate time progress (0 = just started, 1 = ended)
      const totalDuration = propEnd.getTime() - propStart.getTime();
      const elapsedTime = currentTime.getTime() - propStart.getTime();
      const timeProgress = Math.min(1, Math.max(0, elapsedTime / totalDuration));
      
      // Estimate final tallies based on current rate and time remaining
      let newEV: number;
      if (timeProgress > 0 && currentTallies > 0) {
        // Project final count based on current rate
        const projectedFinalCount = currentTallies / timeProgress;
        // Blend between original EV and projected count (weighted by time progress)
        newEV = originalEV * (1 - timeProgress * 0.7) + projectedFinalCount * (timeProgress * 0.7);
      } else {
        // If no time has passed or no tallies, use original EV
        newEV = originalEV;
      }

      // Update odds for all prop options of this prop
      for (const option of propWithTallies.prop_options) {
        const lineValue = Number(option.line);
        const { overOdds, underOdds } = calculateOddsFromEV(newEV, lineValue);
        
        await tx.prop_options.update({
          where: { id: option.id },
          data: {
            odds_over: overOdds,
            odds_under: underOdds,
            modified: new Date(),
            modified_by: currentUser.id
          }
        });
      }
    });

    // Revalidate relevant paths
    revalidatePath('/props');
    revalidatePath('/betslip');
    revalidatePath('/parlays');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting tally:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete tally' 
    };
  }
}

// Helper function to calculate odds from EV and line (same as in add-tally.ts)
function calculateOddsFromEV(ev: number, lineValue: number): { overOdds: number; underOdds: number } {
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
  
  return { overOdds, underOdds };
} 