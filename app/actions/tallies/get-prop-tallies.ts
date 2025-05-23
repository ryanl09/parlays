'use server';

import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function getPropTallies(propId: string) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const tallies = await prisma.prop_points.findMany({
      where: {
        prop_id: propId,
        active: true
      },
      include: {
        users_prop_points_created_byTousers: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        created: 'desc'
      }
    });

    return {
      success: true,
      tallies: tallies.map(tally => ({
        id: tally.id.toString(),
        propId: tally.prop_id,
        created: tally.created,
        createdBy: {
          id: tally.created_by,
          name: tally.users_prop_points_created_byTousers.name
        }
      }))
    };
  } catch (error) {
    console.error('Error fetching tallies:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tallies',
      tallies: []
    };
  }
} 