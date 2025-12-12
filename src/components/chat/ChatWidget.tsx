'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getUsers, getMessages, sendMessage } from '@/app/actions/chat';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { session } from '@/drizzle/schemas/users';

interface ChatUser {
    id: string;
    name: string;
    image?: string | null;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
}

export default function ChatWidget({ currentUserId }: { currentUserId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Polling ref
    const pollingRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        if (isOpen) {
            getUsers().then(setUsers);
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedUser) {
            // Initial fetch
            fetchMessages();
            // Start polling
            pollingRef.current = setInterval(fetchMessages, 3000);
        } else {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setMessages([]);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [selectedUser]);

    const fetchMessages = async () => {
        if (!selectedUser) return;
        const msgs = await getMessages(selectedUser.id);
        const mappedMsgs = msgs.map(m => ({
            id: m.id,
            content: m.content,
            senderId: m.senderId,
            createdAt: m.createdAt
        }));
        setMessages(mappedMsgs);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const tempContent = newMessage;
        setNewMessage(''); // Optimistic clear

        // Optimistic add (optional, but good UX)
        /* setMessages(prev => [...prev, { 
            id: 'temp-' + Date.now(), 
            content: tempContent, 
            senderId: currentUserId, 
            createdAt: new Date() 
        }]); */

        await sendMessage(selectedUser.id, tempContent);
        await fetchMessages();
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 z-50"
            >
                <MessageCircle className="h-6 w-6 text-white" />
            </Button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-semibold">
                    {selectedUser ? selectedUser.name : 'Chats'}
                </h3>
                <div className="flex gap-2">
                    {selectedUser && (
                        <button onClick={() => setSelectedUser(null)} className="text-xs hover:underline opacity-80">Back</button>
                    )}
                    <button onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {!selectedUser ? (
                    <div className="space-y-2">
                        {users.map(u => (
                            <div
                                key={u.id}
                                onClick={() => setSelectedUser(u)}
                                className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer flex items-center gap-3 transition-all"
                            >
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-500" />
                                </div>
                                <span className="font-medium text-gray-700">{u.name}</span>
                            </div>
                        ))}
                        {users.length === 0 && <p className="text-center text-gray-400 text-sm mt-4">No other users found.</p>}
                    </div>
                ) : (
                    <div className="space-y-3 flex flex-col">
                        {messages.length === 0 && <p className="text-center text-gray-400 text-xs mt-4">No messages yet. Say hi!</p>}
                        {messages.map(m => {
                            const isMe = m.senderId === currentUserId;
                            return (
                                <div key={m.id} className={cn("max-w-[80%] p-2 rounded-lg text-sm", isMe ? "bg-blue-600 text-white self-end rounded-br-none" : "bg-white border self-start rounded-bl-none")}>
                                    {m.content}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {selectedUser && (
                <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 h-9 text-sm"
                    />
                    <Button size="sm" type="submit" className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            )}
        </div>
    );
}
