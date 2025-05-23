'use server';

import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function resolveParlays() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const currentTime = new Date();
    let resolvedCount = 0;
    let totalPayout = 0;

    await prisma.$transaction(async (tx) => {
      // Find all active parlays for the current user
      const activeParlays = await tx.parlays.findMany({
        where: {
          user_id: currentUser.id,
          active: true
        },
        include: {
          parlay_props: {
            where: { active: true },
            include: {
              prop_options: {
                include: {
                  props: true
                }
              }
            }
          }
        }
      });

      for (const parlay of activeParlays) {
        // Check if all props in this parlay have expired
        const allPropsExpired = parlay.parlay_props.every(parlayProp => {
          const propEnd = new Date(parlayProp.prop_options.props.end);
          return currentTime > propEnd;
        });

        if (!allPropsExpired) {
          continue; // Skip parlays that haven't fully expired yet
        }

        // Check if this parlay is a winner
        let parlayWon = true;
        const parlayCreated = new Date(parlay.created);

        for (const parlayProp of parlay.parlay_props) {
          const propOption = parlayProp.prop_options;
          const prop = propOption.props;
          const propEnd = new Date(prop.end);
          const line = Number(propOption.line);
          const isOver = parlayProp.is_over;

          // Get tallies for this prop that were created between parlay creation and prop expiration
          const validTallies = await tx.prop_points.findMany({
            where: {
              prop_id: prop.id,
              active: true,
              created: {
                gte: parlayCreated,
                lte: propEnd
              }
            }
          });

          const tallyCount = validTallies.length;

          // Determine if this prop option won
          let propWon = false;
          
          // Handle exact line matches (push scenarios) first
          if (tallyCount === line) {
            // In most betting systems, exact matches are pushes and the bet is returned
            // For simplicity, we'll treat pushes as losses for now
            // You could modify this logic to handle pushes differently
            propWon = false;
          } else if (isOver) {
            // For over bets: tally count must be strictly greater than the line
            propWon = tallyCount > line;
          } else {
            // For under bets: tally count must be strictly less than the line
            propWon = tallyCount < line;
          }

          if (!propWon) {
            parlayWon = false;
            break; // No need to check remaining props if one lost
          }
        }

        if (parlayWon) {
          // Calculate payout based on stored odds
          let totalOdds = 1;
          for (const parlayProp of parlay.parlay_props) {
            const odds = parlayProp.odds;
            
            // Convert American odds to decimal multiplier
            let multiplier: number;
            if (odds > 0) {
              // Positive odds: +150 means win $150 on $100 bet
              multiplier = (odds / 100) + 1;
            } else {
              // Negative odds: -150 means bet $150 to win $100
              multiplier = (100 / Math.abs(odds)) + 1;
            }
            
            totalOdds *= multiplier;
          }

          const payout = Math.round(parlay.coins * totalOdds);
          
          console.log(`Parlay ${parlay.id} won! Bet: ${parlay.coins}, Total odds: ${totalOdds.toFixed(2)}, Payout: ${payout}`);

          // Update user's coins
          await tx.user_coins.upsert({
            where: { user_id: currentUser.id },
            update: {
              coins: {
                increment: payout
              },
              modified: currentTime
            },
            create: {
              user_id: currentUser.id,
              coins: payout,
              modified: currentTime
            }
          });

          totalPayout += payout;
          resolvedCount++;
        } else {
          console.log(`Parlay ${parlay.id} lost.`);
        }

        // Mark parlay as inactive (resolved)
        await tx.parlays.update({
          where: { id: parlay.id },
          data: {
            active: false,
            modified: currentTime
          }
        });
      }
    });

    // Revalidate relevant paths to update UI
    if (resolvedCount > 0) {
      revalidatePath('/parlays');
      revalidatePath('/');
    }

    return { 
      success: true, 
      resolvedCount, 
      totalPayout,
      message: resolvedCount > 0 
        ? `Resolved ${resolvedCount} parlay(s) with total payout of ${totalPayout} coins`
        : 'No parlays to resolve'
    };
  } catch (error) {
    console.error('Error resolving parlays:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to resolve parlays' 
    };
  }
} 