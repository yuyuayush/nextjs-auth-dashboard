"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserButton from "@/components/layout/UserButton";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
    session: any;
}

export default function Navbar({ session }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="p-4 border-b bg-white relative z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/">
                    <h1 className="text-xl font-bold">Auth Dashboard</h1>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-4">
                    {session ? (
                        <>
                            <Link href="/chat">
                                <Button variant="ghost">Chat</Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            <UserButton user={session.user} />
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
                    {session ? (
                        <>
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <UserButton user={session.user} />
                                <span className="font-semibold">{session.user.name}</span>
                            </div>
                            <Link href="/chat" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">Chat</Button>
                            </Link>
                            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                            </Link>
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
