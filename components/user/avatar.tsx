'use client';

import { Avatar as AvatarComponent, AvatarFallback } from "@/components/ui/avatar";

export const Avatar = ({ name }: { name: string }) => {
    const getInitials = (name: string) => {
        if (!name) return '';
        
        if (name.includes(' ')) {
            const nameParts = name.split(' ');
            return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }
        
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <AvatarComponent>
            <AvatarFallback className="bg-muted text-muted-foreground">
                {getInitials(name)}
            </AvatarFallback>
        </AvatarComponent>
    )
}