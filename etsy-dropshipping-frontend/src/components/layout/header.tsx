"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
    const { user } = useAuthStore();

    return (
        <div className="flex items-center p-4 border-b">
            <div className="ml-auto flex items-center gap-x-4">
                <span className="text-sm font-medium">{user?.fullName}</span>
                <Avatar>
                    <AvatarFallback>{user?.fullName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            </div>
        </div>
    );
}
