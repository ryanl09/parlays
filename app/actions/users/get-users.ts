import prisma from "@/lib/prisma"

export const getUsers = async () => {
    const users = await prisma.users.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: [
            { name: 'asc'}
        ]
    });

    if (users === null) return [{ id: 'all', name: 'All' }];

    return [
        { id: 'all', name: 'All' },
        ...users
    ]
}