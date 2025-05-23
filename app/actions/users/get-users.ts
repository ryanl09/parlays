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

    if (users === null) return [];
    return users;
}