'use client';

import { useState } from 'react';
import { User, MessageCircle, UserPlus, Users, Bell, Search } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState('');

    const friends = initialUsers.filter(u =>
        u.friendStatus === 'accepted' &&
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const requests = initialUsers.filter(u => u.friendStatus === 'pending_received');
    const selectedFriend = friends.find(f => f.id === selectedFriendId) || initialUsers.find(u => u.id === selectedFriendId) || null; // Fallback to find anywhere if filtered out, or handle null


    return (
        <div className="flex h-full bg-white md:bg-transparent overflow-hidden">
            {/* Sidebar - Shows on mobile ONLY if no friend selected. Always shows on Desktop. */}
            <div className={cn(
                "flex-col h-full bg-gray-50 border-r md:flex md:w-80 transition-all",
                selectedFriendId ? "hidden md:flex" : "flex w-full"
            )}>
                <div className="p-4 border-b bg-white flex flex-col gap-3 shrink-0 z-20">
                    <div className="flex justify-between items-center h-8">
                        <h2 className="font-bold text-xl text-slate-800 tracking-tight">Messages</h2>
                    </div>
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-xl text-sm transition-all outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                        />
                    </div>
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
                        <div className="px-3 py-2">
                            {friends.length === 0 && (
                                <div className="text-center py-12 px-4">
                                    <div className="w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                        <Users className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <h3 className="text-slate-900 font-semibold mb-1">
                                        {searchQuery ? 'No results found' : 'No chats yet'}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        {searchQuery ? `We couldn't find any friends matching "${searchQuery}"` : 'Find friends in the Explore tab to start messaging!'}
                                    </p>
                                </div>
                            )}
                            {friends.map(friend => (
                                <div
                                    key={friend.id}
                                    onClick={() => setSelectedFriendId(friend.id)}
                                    className={cn(
                                        "p-3 mb-2 rounded-2xl cursor-pointer flex items-center gap-4 transition-all duration-300 border",
                                        selectedFriendId === friend.id
                                            ? "bg-blue-600/5 border-blue-100 shadow-sm ring-1 ring-blue-100"
                                            : "border-transparent hover:bg-slate-50 hover:border-slate-100"
                                    )}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full overflow-hidden relative shadow-sm ring-2 ring-white">
                                            {friend.image ? (
                                                <Image src={friend.image} alt={friend.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 bg-slate-100 text-lg">
                                                    {friend.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        {/* Online Indicator */}
                                        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-[2.5px] border-white rounded-full"></div>
                                    </div>

                                    <div className="overflow-hidden flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className={cn("font-semibold truncate text-[15px]", selectedFriendId === friend.id ? "text-blue-900" : "text-slate-900")}>
                                                {friend.name}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-medium">12:30</span>
                                        </div>

                                        <p className={cn("text-xs truncate font-medium", selectedFriendId === friend.id ? "text-blue-600" : "text-slate-500")}>
                                            Tap to view conversation
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
