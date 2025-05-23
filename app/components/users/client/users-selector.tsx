'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { UserIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  name: string;
}

interface UsersSelectorProps {
  users: User[];
  defaultValue?: string;
  paramName?: string;
}

export const UsersSelector = ({ users, paramName = 'userId' }: UsersSelectorProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentUserId = searchParams.get(paramName) || '';
  
  const handleUserChange = (userId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(paramName, userId);
    
    router.push(`?${params.toString()}`);
  };

  const selectedUser = users.find(user => user.id === currentUserId);

  return (
    <div className='space-y-2'>
      <Label>User</Label>
      <Select value={currentUserId} onValueChange={handleUserChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select user">
            {selectedUser?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

