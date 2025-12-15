"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

export default function Footer() {
    return (
        <footer className="relative bg-slate-950 text-slate-200 overflow-hidden mt-10">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
                                <span className="text-white font-bold text-xl">F</span>
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                FriendHub
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Connecting people, creating memories, and planning adventures together. Your all-in-one platform for social connection and travel planning.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <SocialIcon icon={<Twitter size={18} />} href="#" />
                            <SocialIcon icon={<Facebook size={18} />} href="#" />
                            <SocialIcon icon={<Instagram size={18} />} href="#" />
                            <SocialIcon icon={<Github size={18} />} href="#" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Explore</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><FooterLink href="/dashboard">Dashboard</FooterLink></li>
                            <li><FooterLink href="/gallery">Gallery</FooterLink></li>
                            <li><FooterLink href="/tour-plan">Tour Plan</FooterLink></li>
                        </ul>
                    </div>

                    {/* More Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Connect</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><FooterLink href="/chat">Chat Rooms</FooterLink></li>
                            <li><FooterLink href="/profile">My Profile</FooterLink></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} FriendHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode, href: string }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110 border border-slate-800 hover:border-blue-500"
        >
            {icon}
        </a>
    );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="group-hover:translate-x-1 transition-transform">{children}</span>
        </Link>
    );
}
