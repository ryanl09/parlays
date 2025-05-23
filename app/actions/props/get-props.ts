import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma";

export const getProps = async ({ userId, sortBy }: { userId: string, sortBy: string }) => {
    const session = await getSession();

    if (!session?.user) {
        return;
    }

    let props;

    if (sortBy === 'popular') {
        // For popular sorting, we need to count how many active parlays each prop appears in
        props = await prisma.props.findMany({
            where: {
                AND: [ { user_id: {  not:  session.user.id }  }, {   ...(userId === "all" ? {} : { user_id:userId }) } ],
                active: true,
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
                        },
                        parlay_props: {
                            where: {
                                active: true,
                                parlays: {
                                    active: true
                                }
                            },
                            select: {
                                parlays: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        created: 'asc'
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
        });

        // Transform the data and calculate popularity count
        const propsWithPopularity = props.map((prop) => {
            // Get unique parlay IDs this prop appears in
            const uniqueParlayIds = new Set<string>();
            prop.prop_options.forEach(option => {
                option.parlay_props.forEach(parlayProp => {
                    uniqueParlayIds.add(parlayProp.parlays.id);
                });
            });

            return {
                ...prop,
                popularityCount: uniqueParlayIds.size,
                ev: Number(prop.ev),
                tallies: prop.prop_points.map((tally) => ({
                    id: tally.id.toString(),
                    propId: prop.id,
                    created: tally.created,
                    createdBy: {
                        id: tally.created_by,
                        name: tally.users_prop_points_created_byTousers.name
                    }
                })),
                tallyCount: prop.prop_points.length,
                prop_options: prop.prop_options.map((option) => {
                    return {
                        ...option,
                        line: Number(option.line),
                        odds_over: Number(option.odds_over),
                        odds_under: Number(option.odds_under)
                    }
                })
            };
        });

        // Sort by popularity count (descending), then by created date (newest first) as tiebreaker
        propsWithPopularity.sort((a, b) => {
            if (a.popularityCount !== b.popularityCount) {
                return b.popularityCount - a.popularityCount;
            }
            // For ties, sort by newest first
            return new Date(b.created).getTime() - new Date(a.created).getTime();
        });

        return propsWithPopularity;
    } else {
        // Original logic for other sort types
        props = await prisma.props.findMany({
        where: {
            AND: [ { user_id: {  not:  session.user.id }  }, {   ...(userId === "all" ? {} : { user_id:userId }) }  ],
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
    });
    
    return props.map((prop) => {
        return {
            ...prop,
            ev: Number(prop.ev),
                tallies: prop.prop_points.map((tally) => ({
                    id: tally.id.toString(),
                    propId: prop.id,
                    created: tally.created,
                    createdBy: {
                        id: tally.created_by,
                        name: tally.users_prop_points_created_byTousers.name
                    }
                })),
                tallyCount: prop.prop_points.length,
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
};
