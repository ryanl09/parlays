'use server';

import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function getUserParlays() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const parlays = await prisma.parlays.findMany({
      where: {
        user_id: currentUser.id,
        active: true
      },
      orderBy: {
        created: 'desc'
      },
      include: {
        parlay_props: {
          where: {
            active: true
          },
          include: {
            prop_options: {
              include: {
                props: {
                  include: {
                    users_props_created_byTousers: {
                      select: {
                        id: true,
                        name: true
                      }
                    },
                    prop_points: {
                      where: {
                        active: true
                      },
                      select: {
                        id: true,
                        created: true,
                        created_by: true,
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
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Convert Decimal types to Numbers to avoid serialization issues
    return parlays.map(parlay => ({
      ...parlay,
      parlay_props: parlay.parlay_props.map(parlayProp => ({
        ...parlayProp,
        prop_options: {
          ...parlayProp.prop_options,
          line: Number(parlayProp.prop_options.line),
          props: {
            ...parlayProp.prop_options.props,
            ev: Number(parlayProp.prop_options.props.ev),
            tallies: parlayProp.prop_options.props.prop_points.map((tally) => ({
              id: tally.id.toString(),
              propId: parlayProp.prop_options.props.id,
              created: tally.created,
              createdBy: {
                id: tally.created_by,
                name: tally.users_prop_points_created_byTousers.name
              }
            })),
            tallyCount: parlayProp.prop_options.props.prop_points.length
          }
        }
      }))
    }));
  } catch (error) {
    console.error('Error fetching user parlays:', error);
    return [];
  }
} 