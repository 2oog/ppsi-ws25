'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toggleUserBan } from '@/app/actions/user';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';

interface UserActionsProps {
    userId: number;
    isBanned: boolean | null;
}

export function UserActions({ userId, isBanned }: UserActionsProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleToggleBan = async () => {
        setLoading(true);
        try {
            const result = await toggleUserBan(userId, isBanned);
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                });
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(String(userId))}
                >
                    Copy User ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleBan} disabled={loading} className={isBanned ? "text-green-600" : "text-destructive"}>
                    {isBanned ? 'Unban User' : 'Ban User'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
