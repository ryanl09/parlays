'use client';

import { Avatar as AvatarComponent, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Avatar = ({ name, size = 'md' }: AvatarProps) => {
    const getInitials = (name: string) => {
        if (!name) return '';
        
        if (name.includes(' ')) {
            const nameParts = name.split(' ');
            return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }
        
        return name.substring(0, 2).toUpperCase();
    };

    const sizeClasses = {
        sm: 'h-5 w-5 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-16 w-16 text-lg'
    };

    return (
        <AvatarComponent className={cn(sizeClasses[size])}>
            <AvatarFallback className="bg-muted text-muted-foreground">
                {getInitials(name)}
            </AvatarFallback>
        </AvatarComponent>
    )
}