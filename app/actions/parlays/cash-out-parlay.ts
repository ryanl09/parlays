'use server';

import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function cashOutParlay(parlayId: string) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    let cashOutAmount = 0;

    await prisma.$transaction(async (tx) => {
      // Get the parlay with all its legs and current tally data
      const parlay = await tx.parlays.findUnique({
        where: { 
          id: parlayId,
          user_id: currentUser.id,
          active: true
        },
        include: {
          parlay_props: {
            where: { active: true },
            include: {
              prop_options: {
                include: {
                  props: {
                    include: {
                      prop_points: {
                        where: { active: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!parlay) {
        throw new Error('Parlay not found or already cashed out');
      }

      // Calculate cash out value based on current probability
      let totalProbability = 1;
      
      for (const leg of parlay.parlay_props) {
        const tallies = leg.prop_options.props.prop_points.length;
        const line = Number(leg.prop_options.line);
        const isOver = leg.is_over;
        
        // Calculate probability based on current tallies vs line
        let legProbability = 0.5; // Default 50/50
        
        if (tallies === 0) {
          // No data yet, use original odds probability
          const odds = leg.odds;
          if (odds > 0) {
            legProbability = 100 / (odds + 100);
          } else {
            legProbability = Math.abs(odds) / (Math.abs(odds) + 100);
          }
        } else {
          // Calculate probability based on current tallies
          const distance = Math.abs(tallies - line);
          const maxDistance = Math.max(line, 10); // Normalize to reasonable scale
          
          if (isOver) {
            if (tallies > line) {
              // Already winning, high probability
              legProbability = 0.8 + (distance / maxDistance) * 0.15;
            } else {
              // Losing, probability decreases as we get further from line
              legProbability = 0.3 - (distance / maxDistance) * 0.25;
            }
          } else {
            if (tallies < line) {
              // Already winning, high probability
              legProbability = 0.8 + (distance / maxDistance) * 0.15;
            } else {
              // Losing, probability decreases as we get further from line
              legProbability = 0.3 - (distance / maxDistance) * 0.25;
            }
          }
          
          // Clamp between 0.05 and 0.95
          legProbability = Math.max(0.05, Math.min(0.95, legProbability));
        }
        
        totalProbability *= legProbability;
      }

      // Calculate cash out amount
      // Cash out = (bet amount) + (potential profit * total probability * cash out factor)
      const originalOdds = parlay.parlay_props.reduce((total, leg) => {
        const odds = leg.odds;
        const decimal = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
        return total * decimal;
      }, 1);
      
      const potentialProfit = parlay.coins * (originalOdds - 1);
      const cashOutFactor = 0.85; // House takes 15% on cash outs
      
      cashOutAmount = Math.round(parlay.coins + (potentialProfit * totalProbability * cashOutFactor));
      
      // Ensure minimum cash out is at least 10% of original bet
      cashOutAmount = Math.max(cashOutAmount, Math.round(parlay.coins * 0.1));

      // Update user's coins
      await tx.user_coins.upsert({
        where: { user_id: currentUser.id },
        update: {
          coins: {
            increment: cashOutAmount
          },
          modified: new Date()
        },
        create: {
          user_id: currentUser.id,
          coins: cashOutAmount,
          modified: new Date()
        }
      });

      // Mark parlay as inactive (cashed out)
      await tx.parlays.update({
        where: { id: parlayId },
        data: {
          active: false,
          modified: new Date()
        }
      });
    });

    // Revalidate relevant paths
    revalidatePath('/parlays');
    revalidatePath('/');

    return { 
      success: true, 
      cashOutAmount,
      message: `Successfully cashed out for ${cashOutAmount} coins`
    };
  } catch (error) {
    console.error('Error cashing out parlay:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to cash out parlay' 
    };
  }
} 