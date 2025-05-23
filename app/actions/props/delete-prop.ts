'use server';

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const deleteProp = async ({ propId, path }: { propId: string, path: string }) => {
    const session = await getSession();

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const { id: userId } = session.user;

    try {

        const deleted = await prisma.$transaction(async (tx) => {
            const prop = await prisma.props.update({
                where: {
                    id: propId,
                },
                data: {
                    active: false,
                    modified: new Date(),
                    modified_by: userId,
                }
            });

            const updateLines = await tx.prop_options.updateMany({
                where: {
                    prop_id: propId,
                },
                data: {
                    active: false,
                }
            });

            const updateParlays = await tx.parlays.updateMany({
                where: {
                    parlay_props: {
                        some: {
                            prop_options: {
                                prop_id: propId,
                            }
                        }
                    }
                },
                data: {
                    active: false,
                }
            });

            revalidatePath(path);
            return { success: 'Prop deleted' };
        });
    } catch (e) {
        throw e;
    }

}