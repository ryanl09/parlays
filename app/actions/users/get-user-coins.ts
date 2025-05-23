'use server';

import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function getUserCoins() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return null;
    }

    const userCoins = await prisma.user_coins.findUnique({
      where: { user_id: currentUser.id }
    });

    return userCoins?.coins ?? 0;
  } catch (error) {
    console.error('Error fetching user coins:', error);
    return 0;
  }
} 