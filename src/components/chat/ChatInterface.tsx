'use client';

import { useState } from 'react';
import { User, MessageCircle, UserPlus, Users, Bell } from 'lucide-react';
import ExploreUsers from './ExploreUsers';
import RequestList from './RequestList';
import ChatWindow from './ChatWindow';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UserWithStatus {
    id: string;
    name: string;
    image?: string | null;
    friendStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
    requestId?: string;
}

export default function ChatInterface({
    initialUsers,
    currentUserId
}: {
    initialUsers: UserWithStatus[];
    currentUserId: string;
}) {
    const [activeTab, setActiveTab] = useState<'chats' | 'friends' | 'requests' | 'explore'>('chats');
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

    const friends = initialUsers.filter(u => u.friendStatus === 'accepted');
    const requests = initialUsers.filter(u => u.friendStatus === 'pending_received');
    const selectedFriend = friends.find(f => f.id === selectedFriendId) || null;


    return (
        <div className="flex h-full bg-white md:bg-transparent overflow-hidden">
            {/* Sidebar - Shows on mobile ONLY if no friend selected. Always shows on Desktop. */}
            <div className={cn(
                "flex-col h-full bg-gray-50 border-r md:flex md:w-80 transition-all",
                selectedFriendId ? "hidden md:flex" : "flex w-full"
            )}>
                <div className="p-4 border-b bg-white flex justify-between items-center h-16 shrink-0 z-20">
                    <h2 className="font-bold text-xl text-slate-800 tracking-tight">Messages</h2>
                </div>

                {/* Tabs - Sleek Segmented Control */}
                <div className="px-4 py-3 bg-white border-b sticky top-0 z-10">
                    <div className="flex p-1 gap-1 bg-slate-100 rounded-xl">
                        <button
                            onClick={() => setActiveTab('chats')}
                            className={cn(
                                "flex-1 py-1.5 rounded-lg flex justify-center transition-all duration-200 text-sm font-medium",
                                activeTab === 'chats' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                            title="Chats"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={cn(
                                "flex-1 py-1.5 rounded-lg flex justify-center relative transition-all duration-200 text-sm font-medium",
                                activeTab === 'requests' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                            title="Requests"
                        >
                            <Bell className="w-5 h-5" />
                            {requests.length > 0 && <span className="absolute top-1.5 right-1/3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={cn(
                                "flex-1 py-1.5 rounded-lg flex justify-center transition-all duration-200 text-sm font-medium",
                                activeTab === 'explore' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                            title="Explore"
                        >
                            <UserPlus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {activeTab === 'chats' && (
                        <div className="p-2 space-y-1">
                            {friends.length === 0 && (
                                <div className="text-center py-12 px-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Users className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-slate-900 font-medium mb-1">No chats yet</h3>
                                    <p className="text-slate-500 text-sm">Find friends in the Explore tab to start messaging!</p>
                                </div>
                            )}
                            {friends.map(friend => (
                                <div
                                    key={friend.id}
                                    onClick={() => setSelectedFriendId(friend.id)}
                                    className={cn(
                                        "p-3 mx-2 rounded-xl cursor-pointer flex items-center gap-4 transition-all duration-200 border border-transparent",
                                        selectedFriendId === friend.id
                                            ? "bg-blue-50 border-blue-100 shadow-sm"
                                            : "hover:bg-slate-50 hover:border-slate-100"
                                    )}
                                >
                                    <div className="w-12 h-12 bg-white rounded-full overflow-hidden relative flex-shrink-0 shadow-sm ring-2 ring-slate-50">
                                        {friend.image ? (
                                            <Image src={friend.image} alt={friend.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 bg-slate-100 text-lg">
                                                {friend.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {/* Online Indicator (Mockup for now) */}
                                        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="overflow-hidden flex-1">
                                        <div className="flex justify-between items-baseline">
                                            <p className={cn("font-semibold truncate", selectedFriendId === friend.id ? "text-blue-900" : "text-slate-900")}>{friend.name}</p>
                                            <span className="text-[10px] text-slate-400 font-mono">12:30</span>
                                            {/* Timestamp would go here */}
                                        </div>

                                        <p className={cn("text-xs truncate", selectedFriendId === friend.id ? "text-blue-700/80" : "text-slate-500")}>
                                            Tap to chat
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="p-4">
                            <RequestList users={initialUsers} />
                        </div>
                    )}

                    {activeTab === 'explore' && (
                        <div className="p-4">
                            <ExploreUsers users={initialUsers} />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area - Shows on mobile ONLY if friend selected. Always shows on Desktop. */}
            <div className={cn(
                "flex-col flex-1 bg-white relative inset-0 md:relative md:inset-auto md:flex",
                selectedFriendId ? "flex w-full" : "hidden md:flex"
            )}>
                <ChatWindow
                    selectedUser={selectedFriend}
                    currentUserId={currentUserId}
                    onBack={() => setSelectedFriendId(null)}
                />
            </div>
        </div>
    );
}
