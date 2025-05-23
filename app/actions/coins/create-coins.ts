'use server';

import prisma from "@/lib/prisma";

export const createCoins = async ({ username, amount }: { username: string, amount: number }) => {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.users.findFirst({
                where: {
                    username: {
                        equals: username.toLowerCase()
                    }
                }
            });

            if (!user?.id) {
                throw new Error("User not found");
            }

            const userCoins = await tx.user_coins.upsert({
                where: {
                    user_id: user.id
                },
                update: {
                    coins: {
                        increment: amount
                    }
                },
                create: {
                    user_id: user.id,
                    coins: amount
                }
            });

            return { success: true, coins: userCoins.coins, userId: user.id };
        });

        return result;
    } catch (e) {
        throw e;
    }
}