'use server';

import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';

interface CreateParlayData {
  title?: string;
  coins: number;
  betslipItems: {
    propId: string;
    lineId: string;
    selection: 'over' | 'under';
    odds: number;
  }[];
}

export async function createParlay(data: CreateParlayData) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Validate input
    if (!data.coins || data.coins <= 0) {
      throw new Error('Invalid bet amount');
    }

    if (!data.betslipItems || data.betslipItems.length === 0) {
      throw new Error('No bets selected');
    }

    // Check user's coin balance
    const userCoins = await prisma.user_coins.findUnique({
      where: { user_id: currentUser.id }
    });

    if (!userCoins) {
      throw new Error('User coin balance not found');
    }

    if (userCoins.coins < data.coins) {
      throw new Error(`Insufficient coins. You have ${userCoins.coins} coins but tried to bet ${data.coins}`);
    }

    // Verify all prop options exist and are still active
    const propOptionIds = data.betslipItems.map(item => item.lineId);
    const propOptions = await prisma.prop_options.findMany({
      where: {
        id: { in: propOptionIds },
        active: true
      }
    });

    if (propOptions.length !== propOptionIds.length) {
      throw new Error('Some prop options are no longer available');
    }

    // Generate parlay ID
    const parlayId = crypto.randomUUID();

    // Create parlay and update user coins in a transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the parlay
      await tx.parlays.create({
        data: {
          id: parlayId,
          user_id: currentUser.id,
          name: data.title || null,
          coins: data.coins,
          created: new Date(),
          modified: new Date(),
          active: true
        }
      });

      // Create parlay_props entries with the odds that were locked in when the parlay was created
      const parlayPropsData = data.betslipItems.map(item => ({
        parlay_id: parlayId,
        prop_option_id: item.lineId,
        is_over: item.selection === 'over',
        odds: item.odds, // Store the odds that were guaranteed when the parlay was created
        created: new Date(),
        modified: new Date(),
        active: true
      }));

      await tx.parlay_props.createMany({
        data: parlayPropsData
      });

      // Deduct coins from user balance
      await tx.user_coins.update({
        where: { user_id: currentUser.id },
        data: {
          coins: userCoins.coins - data.coins,
          modified: new Date()
        }
      });
    });

    // Revalidate relevant paths
    revalidatePath('/parlays');
    revalidatePath('/betslip');
    
    return {
      success: true,
      parlayId,
      message: 'Parlay created successfully!'
    };

  } catch (error) {
    console.error('Error creating parlay:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create parlay'
    };
  }
} 