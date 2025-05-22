import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/user/avatar";
import prisma from "@/lib/prisma"
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

export default async function UsersPage() {

    const users = await prisma.users.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: [
            { name: "asc" }
        ]
    });

    return (
        <div className="space-y-4">
            <h1 className='text-lg font-medium'>Users</h1>
            <div className="space-y-2">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-2">
                        <Avatar name={user.name} />
                        {user.name}
                        <Link href={`/users/${user.id}`} className="cursor-pointer">
                            <Button variant="ghost" size="icon">
                                <ExternalLinkIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}