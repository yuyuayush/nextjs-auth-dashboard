"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserButton from "@/components/layout/UserButton";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSession, authClient } from "@/lib/auth-client";

interface NavbarProps {
    session: any;
}

export default function Navbar({ session: initialSession }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession(); // Use client-side session for dynamic updates

    // Fallback to initialSession if client session triggers loading (optional, but hook usually handles it well) 
    // better-auth's useSession returns null/data. 
    // We can use the hook's data as the primary source of truth for the UI state.
    const currentSession = session || initialSession;

    return (
        <header className="p-4 border-b bg-white relative z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/newlogo.jpg" alt="FriendHub Logo" className="w-12 h-12 object-cover rounded-full" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                        FriendHub
                    </h1>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-4">
                    {currentSession ? (
                        <>
                            <Link href="/chat">
                                <Button variant="ghost">Chat</Button>
                            </Link>
                            <Link href="/map">
                                <Button variant="ghost">Map</Button>
                            </Link>
                            <Link href="/tour-plan">
                                <Button variant="ghost">Tour Plan</Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            <Link href="/profile">
                                <Button variant="ghost">Profile</Button>
                            </Link>
                            <UserButton user={currentSession.user} />
                        </>
                    ) : (
                        <>
                            <Link href="/auth/signin">
                                <Button variant="outline">Sign In</Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button>Sign Up</Button>
                            </Link>
                        </>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full bg-white border-b shadow-lg flex flex-col p-4 gap-4 md:hidden">
                    {currentSession ? (
                        <>
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <UserButton user={currentSession.user} />
                                <span className="font-semibold">{currentSession.user.name}</span>
                            </div>
                            <Link href="/chat" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">Chat</Button>
                            </Link>
                            <Link href="/map" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">Map</Button>
                            </Link>
                            <Link href="/tour-plan" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">Tour Plan</Button>
                            </Link>
                            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                            </Link>
                            <Link href="/profile" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">Profile</Button>
                            </Link>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={async () => {
                                    await authClient.signOut();
                                    setIsOpen(false);
                                    window.location.href = "/";
                                }}
                            >
                                Log Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                                <Button variant="outline" className="w-full">Sign In</Button>
                            </Link>
                            <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                                <Button className="w-full">Sign Up</Button>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
