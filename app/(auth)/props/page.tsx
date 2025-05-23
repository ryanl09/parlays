import { getProps } from "@/app/actions/props/get-props";
import { getUsers } from "@/app/actions/users/get-users";
import { CreatePropDialog } from "@/app/components/props/create-prop-dialog";
import { PropsListClient } from "@/app/components/props/props-list-client";
import { PropsSortSelector, PropsSortType } from "@/app/components/props/props-sort-selector";
import { PropsRefreshButton } from "@/app/components/props/props-refresh-button";
import { UsersSelector } from "@/app/components/users/client/users-selector";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function PropsPage({ searchParams }: { searchParams: { userId?: string|null, sortBy: PropsSortType|null } }) {
    const users = await getUsers();
    let { userId, sortBy } = await searchParams;

    const currentUser = await getCurrentUser()

    const filteredUsers = users.filter((user) => user.id !== currentUser?.id)

    if (!userId) {
        userId = filteredUsers[0].id;
    }

    let userExists = filteredUsers.find((user) => user.id === userId);
    
    if (!userExists) {
        userId = 'all';
        userExists = filteredUsers.find((user) => user.id === userId);
    }

    if (!sortBy) {
        sortBy = 'newest';
    };

    console.log('Props page - userId:', userId, 'sortBy:', sortBy);

    const props = await getProps({ userId, sortBy });
    
    return (
        <div>
            <div className="flex items-center gap-2 flex-wrap">
                <UsersSelector users={filteredUsers} />
                <PropsSortSelector defaultValue={sortBy} />
                <div className="ml-auto">
                    <div>&nbsp;</div>
                    <PropsRefreshButton />
                </div>
            </div>
            <Separator className="my-6" />
            <div className='flex items-center gap-2'>
                <h1 className='text-xl font-medium'>{userExists?.name} props</h1>
                <Badge variant='default'>{props?.length}</Badge>
                <CreatePropDialog className='ml-auto' users={filteredUsers.filter((user) => user.id !== 'all' )} />
            </div>
            
            <PropsListClient 
                initialProps={props || []} 
                currentUser={currentUser || { id: '', name: '' }}
            />
        </div>
    )
}

export const LoadingInput = () => {
    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-4 bg-gray-200 rounded-full"></div>
            <div className="w-20 h-4 bg-gray-200 rounded-full"></div>
        </div>
    )
}