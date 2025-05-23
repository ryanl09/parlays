import { getProps } from "@/app/actions/props/get-props";
import { getUsers } from "@/app/actions/users/get-users";
import { CreatePropDialog } from "@/app/components/props/create-prop-dialog";
import { PropsListClient } from "@/app/components/props/props-list-client";
import { PropsSortSelector, PropsSortType } from "@/app/components/props/props-sort-selector";
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

    filteredUsers.unshift({
        id: 'all',
        name: 'All',
    })

    // Only default to first user if no userId is provided at all
    if (!userId) {
        userId = filteredUsers[0].id;
    }

    // Find the user after potentially setting the default
    let userExists = filteredUsers.find((user) => user.id === userId);
    
    // If the userId doesn't exist in our filtered users, fall back to 'all'
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
            <div className="flex items-center gap-2">
                <UsersSelector users={filteredUsers} />
                <PropsSortSelector defaultValue={sortBy} />
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