"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserButton from "@/components/layout/UserButton";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Gamepad2 } from "lucide-react";
import { useSession, authClient } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";

interface NavbarProps {
    session: any;
}

export default function Navbar({ session: initialSession }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { data: session } = useSession(); // Use client-side session for dynamic updates

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Fallback to initialSession if client session triggers loading (optional, but hook usually handles it well) 
    // better-auth's useSession returns null/data. 
    // We can use the hook's data as the primary source of truth for the UI state.
    const currentSession = session || initialSession;

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 h-16">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <img src="/logo.png" alt="FriendHub Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                        FriendHub
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {currentSession ? (
                        <>
                            <div className="flex gap-2">
                                <Link href="/chat">
                                    <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full transition-all">Chat</Button>
                                </Link>
                                <Link href="/map">
                                    <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full transition-all">Map</Button>
                                </Link>
                                <Link href="/tour-plan">
                                    <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full transition-all">Tour Plan</Button>
                                </Link>
                                <Link href="/games">
                                    <Button variant="ghost" className="text-slate-600 hover:text-purple-600 hover:bg-purple-50/50 rounded-full transition-all flex items-center gap-1">
                                        <Gamepad2 className="w-4 h-4" /> Games
                                    </Button>
                                </Link>
                                <Link href="/dashboard">
                                    <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full transition-all">Dashboard</Button>
                                </Link>
                                <Link href="/profile">
                                    <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full transition-all">Profile</Button>
                                </Link>
                            </div>
                            <div className="pl-4 border-l border-slate-200">
                                <UserButton user={currentSession.user} />
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/auth/signin">
                                <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full">Sign In</Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-opacity shadow-md shadow-indigo-200 text-white border-0">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative z-50"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-full bg-white/90 backdrop-blur-md border-b shadow-xl flex flex-col p-4 gap-2 md:hidden overflow-hidden"
                    >
                        {currentSession ? (
                            <>
                                <div className="flex items-center gap-3 pb-3 border-b border-indigo-100 mb-2">
                                    <UserButton user={currentSession.user} />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{currentSession.user.name}</span>
                                        <span className="text-xs text-slate-500">{currentSession.user.email}</span>
                                    </div>
                                </div>
                                <Link href="/chat" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                        </div>
                                        Chat
                                    </Button>
                                </Link>
                                <Link href="/map" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                                        </div>
                                        Map
                                    </Button>
                                </Link>
                                <Link href="/tour-plan" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3 text-orange-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                                        </div>
                                        Tour Plan
                                    </Button>
                                </Link>
                                <Link href="/games" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 text-purple-600">
                                            <Gamepad2 className="w-4 h-4" />
                                        </div>
                                        Games
                                    </Button>
                                </Link>
                                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                        </div>
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link href="/profile" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3 text-pink-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        </div>
                                        Profile
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                    onClick={async () => {
                                        await authClient.signOut();
                                        setIsOpen(false);
                                        window.location.href = "/";
                                    }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 text-red-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                    </div>
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full rounded-xl">Sign In</Button>
                                </Link>
                                <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-indigo-200">Sign Up</Button>
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
