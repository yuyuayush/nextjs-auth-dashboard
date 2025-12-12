'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getMessages, sendMessage } from '@/app/actions/chat';
import { Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

export default function ChatWindow({
    selectedUser,
    currentUserId
}: {
    selectedUser: ChatUser | null;
    currentUserId: string;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<NodeJS.Timeout>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages();
            pollingRef.current = setInterval(fetchMessages, 2000); // 2s polling
        } else {
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

        // Only update if length changed or last message different to avoid re-renders (basic check)
        setMessages(prev => {
            if (prev.length !== mappedMsgs.length) return mappedMsgs;
            if (prev.length > 0 && mappedMsgs.length > 0 && prev[prev.length - 1].id !== mappedMsgs[mappedMsgs.length - 1].id) return mappedMsgs;
            return prev;
        });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const tempContent = newMessage;
        setNewMessage('');

        await sendMessage(selectedUser.id, tempContent);
        await fetchMessages();
    };

    if (!selectedUser) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
                <p>Select a friend to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-white">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden relative">
                    {selectedUser.image ? (
                        <Image src={selectedUser.image} alt={selectedUser.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                            {selectedUser.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
                {messages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-10">No messages yet. Say hello! 👋</p>
                )}
                {messages.map(m => {
                    const isMe = m.senderId === currentUserId;
                    return (
                        <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[70%] p-3 rounded-2xl text-sm shadow-sm",
                                isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 border rounded-bl-none"
                            )}>
                                {m.content}
                                <p className={cn("text-[10px] mt-1 opacity-70", isMe ? "text-blue-100" : "text-gray-400")}>
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
                <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}
