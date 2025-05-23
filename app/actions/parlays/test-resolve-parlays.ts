'use server';

import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function testResolveParlays() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const currentTime = new Date();

    // Find all active parlays for debugging
    const activeParlays = await prisma.parlays.findMany({
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

    const debugInfo = [];

    for (const parlay of activeParlays) {
      const parlayCreated = new Date(parlay.created);
      
      // Check if all props in this parlay have expired
      const propExpirationInfo = parlay.parlay_props.map(parlayProp => {
        const propEnd = new Date(parlayProp.prop_options.props.end);
        return {
          propId: parlayProp.prop_options.props.id,
          propDescription: parlayProp.prop_options.props.description,
          line: Number(parlayProp.prop_options.line),
          isOver: parlayProp.is_over,
          odds: parlayProp.odds,
          expiration: propEnd,
          hasExpired: currentTime > propEnd
        };
      });

      const allPropsExpired = propExpirationInfo.every(prop => prop.hasExpired);

      debugInfo.push({
        parlayId: parlay.id,
        parlayCreated,
        coinsBet: parlay.coins,
        allPropsExpired,
        propCount: parlay.parlay_props.length,
        props: propExpirationInfo
      });
    }

    return { 
      success: true, 
      activeParlaysCount: activeParlays.length,
      debugInfo 
    };
  } catch (error) {
    console.error('Error testing parlay resolution:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to test parlay resolution' 
    };
  }
} 