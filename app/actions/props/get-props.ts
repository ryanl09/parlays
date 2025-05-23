import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma";

export const getProps = async ({ userId, sortBy }: { userId: string, sortBy: string }) => {
    const session = await getSession();

    if (!session?.user) {
        return;
    }

    const props = await prisma.props.findMany({
        where: {
            ...(userId === 'all' ? {} : { user_id: userId }),
            active: true,
        },
        orderBy: {
            created: sortBy === 'oldest' ? 'asc' : 'desc'
        },
        include: {
            users_props_created_byTousers: {
                select: {
                    id: true,
                    name: true,
                }
            },
            users_props_user_idTousers: {
                select: {
                    id: true,
                    name: true,
                }
            },
            prop_options: {
                where: {
                    active: true
                },
                select: {
                    id: true,
                    line: true,
                    odds_over: true,
                    odds_under: true,
                    created: true,
                    users_prop_options_created_byTousers: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    created: 'asc'
                }
            }
        }
    });
    
    return props.map((prop) => {
        return {
            ...prop,
            ev: Number(prop.ev),
            prop_options: prop.prop_options.map((option) => {
                return {
                    ...option,
                    line: Number(option.line),
                    odds_over: Number(option.odds_over),
                    odds_under: Number(option.odds_under)
                }
            })
        }
    });
}
