import React from 'react';
import { cn } from '../../lib/utils'; // Try relative path to be safe, assuming structure

interface MobileLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function MobileLayout({ children, className }: MobileLayoutProps) {
    return (
        <div className="min-h-screen bg-black flex justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black">
            <div className={cn("w-full max-w-md bg-background min-h-screen relative shadow-2xl shadow-zinc-900 border-x border-zinc-800/50", className)}>
                {children}
            </div>
        </div>
    );
}
