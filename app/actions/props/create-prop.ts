'use server';

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export type UserEV = {
    userId: string;
    ev: number;
}

export const createProp = async ({ 
    description, 
    userEvs, 
    endDate,
    path 
}: { 
    description: string, 
    userEvs: UserEV[], 
    endDate: Date,
    path: string 
}) => {
    const session = await getSession();

    if (!session) {
        throw new Error('Unauthorized');
    }

    try {
        const prop = await prisma.props.createMany({
            data: userEvs.map((userEv) => ({
                id: uuidv4(),
                description,
                user_id: userEv.userId,
                ev: userEv.ev,
                end: endDate,
                created_by: session.user.id,
                modified_by: session.user.id,
            }))
        })

        revalidatePath(path);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to create prop');
    }
}