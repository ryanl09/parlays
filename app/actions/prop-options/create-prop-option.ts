'use server';

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

type CreatePropOptionParams = {
    propId: string;
    line: number;
    oddsOver: number;
    oddsUnder: number;
    path?: string;
};

export async function createPropOption({
    propId,
    line,
    oddsOver,
    oddsUnder,
}: CreatePropOptionParams) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("Unauthorized");
        }

        const id = uuidv4();

        // Create the prop option
        await prisma.prop_options.create({
            data: {
                id,
                prop_id: propId,
                line,
                odds_over: oddsOver,
                odds_under: oddsUnder,
                created: new Date(),
                modified: new Date(),
                created_by: currentUser.id,
                modified_by: currentUser.id,
                active: true
            }
        });

        return { success: true, id };
    } catch (error) {
        console.error("Error creating prop option:", error);
        throw new Error("Failed to create prop option");
    }
}