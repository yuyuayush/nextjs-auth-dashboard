import { getMessages, sendMessage, uploadChatAttachment } from '@/app/actions/chat';
import { Send, User, Paperclip, Loader2, ChevronLeft, Smile, FileText, Video as VideoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';
import { EmojiClickData } from 'emoji-picker-react';
import imageCompression from 'browser-image-compression';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface ChatUser {
    id: string;
    name: string;
    image?: string | null;
}

interface Message {
    id: string;
    content: string;
    attachmentUrl: string | null;
    attachmentType: string | null;
    senderId: string;
    createdAt: Date;
}

export default function ChatWindow({
    selectedUser,
    currentUserId,
    onBack
}: {
    selectedUser: ChatUser | null;
    currentUserId: string;
    onBack?: () => void;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<NodeJS.Timeout>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        // Close picker when clicking outside
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            attachmentUrl: m.attachmentUrl,
            attachmentType: m.attachmentType,
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

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if ((!newMessage.trim()) || !selectedUser) return;

        const tempContent = newMessage;
        setNewMessage('');
        setShowEmojiPicker(false);

        await sendMessage(selectedUser.id, tempContent);
        await fetchMessages();
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0];
        if (!file || !selectedUser) return;

        setIsUploading(true);
        try {
            // Compress if image
            if (file.type.startsWith('image/')) {
                toast.loading("Compressing image...");
                file = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                });
                toast.dismiss();
            }

            toast.loading("Sending file...");
            const formData = new FormData();
            formData.append("file", file);
            const { url, type } = await uploadChatAttachment(formData);

            let content = "Shared a file";
            if (type === 'image') content = "Shared an image";
            if (type === 'video') content = "Shared a video";

            await sendMessage(selectedUser.id, content, url, type);
            await fetchMessages();
            toast.dismiss();
            toast.success("File sent");
        } catch (error: any) {
            toast.dismiss();
            console.error(error);
            toast.error(error.message || "Failed to send file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!selectedUser) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
                <p>Select a friend to start chatting</p>
                {/* Mobile Back Button for empty state if needed, though usually covered by parent logic */}
                <Button variant="ghost" className="md:hidden mt-4 text-blue-600" onClick={onBack}>
                    Back to List
                </Button>
            </div>
        );
    }

    const renderAttachment = (url: string | null, type: string | null) => {
        if (!url) return null;

        if (type === 'image') {
            return (
                <div className="relative w-48 h-48 rounded-lg overflow-hidden my-2 border bg-gray-100">
                    <Image src={url} alt="Attachment" fill className="object-cover" />
                </div>
            );
        }

        if (type === 'video') {
            return (
                <div className="w-64 rounded-lg overflow-hidden my-2 border bg-black">
                    <video src={url} controls className="w-full h-full" />
                </div>
            );
        }

        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-gray-100/50 rounded-lg my-2 border hover:bg-gray-100 transition-colors"
            >
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <FileText className="w-5 h-5" />
                </div>
                <div className="text-xs">
                    <p className="font-medium text-gray-700 truncate max-w-[150px]">
                        {url.split('/').pop()}
                    </p>
                    <p className="text-gray-500">Click to download</p>
                </div>
            </a>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-white h-16 shadow-sm z-10">
                <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={onBack}>
                    <ChevronLeft className="w-6 h-6" />
                </Button>
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
                                {m.attachmentUrl ? (
                                    <>
                                        {renderAttachment(m.attachmentUrl, m.attachmentType)}
                                        {m.content && m.content !== 'Shared a file' && m.content !== 'Shared an image' && m.content !== 'Shared a video' && (
                                            <p className="mt-1">{m.content}</p>
                                        )}
                                    </>
                                ) : (
                                    m.content
                                )}
                                <p className={cn("text-[10px] mt-1 opacity-70", isMe ? "text-blue-100" : "text-gray-400")}>
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t relative">
                {showEmojiPicker && (
                    <div className="absolute bottom-20 left-4 z-50 shadow-xl rounded-xl" ref={pickerRef}>
                        <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
                    </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2 items-end">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    // accept="image/*" // Remove accept to allow all files
                    />

                    <div className="flex gap-1 pb-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-blue-600"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-yellow-500"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <Smile className="w-5 h-5" />
                        </Button>
                    </div>

                    <Input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!newMessage.trim() && !isUploading}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
