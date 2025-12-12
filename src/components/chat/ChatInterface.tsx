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
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 bg-gray-50 border-r flex flex-col">
                <div className="p-4 border-b bg-white">
                    <h2 className="font-bold text-xl text-gray-800">Messages</h2>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-1 bg-gray-100 border-b">
                    <button
                        onClick={() => setActiveTab('chats')}
                        className={cn("flex-1 p-2 rounded-lg flex justify-center hover:bg-white transition-colors", activeTab === 'chats' && "bg-white shadow-sm text-blue-600")}
                        title="Chats"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={cn("flex-1 p-2 rounded-lg flex justify-center relative hover:bg-white transition-colors", activeTab === 'requests' && "bg-white shadow-sm text-blue-600")}
                        title="Requests"
                    >
                        <Bell className="w-5 h-5" />
                        {requests.length > 0 && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('explore')}
                        className={cn("flex-1 p-2 rounded-lg flex justify-center hover:bg-white transition-colors", activeTab === 'explore' && "bg-white shadow-sm text-blue-600")}
                        title="Explore"
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'chats' && (
                        <div className="p-2 space-y-1">
                            {friends.length === 0 && <p className="text-center text-gray-400 text-sm mt-8">No friends yet. Go to Explore!</p>}
                            {friends.map(friend => (
                                <div
                                    key={friend.id}
                                    onClick={() => setSelectedFriendId(friend.id)}
                                    className={cn(
                                        "p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors",
                                        selectedFriendId === friend.id ? "bg-blue-50 border-blue-100" : "hover:bg-gray-100"
                                    )}
                                >
                                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden relative">
                                        {friend.image ? (
                                            <Image src={friend.image} alt={friend.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                                                {friend.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{friend.name}</p>
                                        <p className="text-xs text-gray-500">Tap to chat</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <RequestList users={initialUsers} />
                    )}

                    {activeTab === 'explore' && (
                        <ExploreUsers users={initialUsers} />
                    )}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col">
                <ChatWindow selectedUser={selectedFriend} currentUserId={currentUserId} />
            </div>
        </div>
    );
}
