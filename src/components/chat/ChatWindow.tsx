import { getMessages, sendMessage, uploadChatAttachment } from '@/app/actions/chat';
import Link from 'next/link';
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
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { Phone } from 'lucide-react';
import { syncUser } from '@/app/actions/stream';

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

    // Stream Video Hook
    const videoClient = useStreamVideoClient();

    const handleStartCall = async (video: boolean) => {
        if (!videoClient || !selectedUser) {
            toast.error("Video calling unavailable (Check Keys)");
            return;
        }

        try {
            // Ensure the target user exists in Stream backend
            await syncUser(
                selectedUser.id,
                selectedUser.name,
                selectedUser.image || undefined
            );

            const callId = crypto.randomUUID();
            const call = videoClient.call('default', callId);

            await call.getOrCreate({
                ring: true,
                data: {
                    members: [{ user_id: currentUserId }, { user_id: selectedUser.id }],
                    custom: {
                        type: video ? 'video' : 'audio' // Store type in call data too
                    }
                },
            });

            console.log("Stream: Created call:", callId);
            toast.success(`Starting ${video ? 'video' : 'audio'} call...`);

            // Open the dedicated call page in a new tab with video param
            window.open(`/call/${callId}?video=${video}`, '_blank');

        } catch (error: any) {
            console.error("Call failed:", error);
            const errorMessage = error.message || "Unknown error";
            toast.error(`Failed to start call: ${errorMessage}`);
        }
    };

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
            <div className="p-3 md:p-4 border-b flex items-center gap-2 md:gap-4 bg-white/80 backdrop-blur-md h-16 shadow-sm z-10 sticky top-0">
                <Button variant="ghost" size="icon" className="md:hidden -ml-1 text-slate-500 hover:bg-slate-100 rounded-full shrink-0" onClick={onBack}>
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <Link href={`/user/${selectedUser.id}`} className="block relative group shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-full overflow-hidden relative ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
                        {selectedUser.image ? (
                            <Image src={selectedUser.image} alt={selectedUser.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-sm md:text-lg">
                                {selectedUser.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </Link>
                <div className="flex-1 min-w-0 ml-1 md:ml-0">
                    <h2 className="font-bold text-slate-900 truncate text-sm md:text-base">{selectedUser.name}</h2>
                    <p className="text-[10px] md:text-xs text-green-600 flex items-center gap-1 font-medium">
                        Active now
                    </p>
                </div>
                <div className="flex gap-2 ml-auto shrink-0 items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartCall(true)}
                        className="text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-all w-9 h-9 md:w-10 md:h-10 shadow-sm"
                        title="Video Call"
                    >
                        <VideoIcon className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartCall(false)}
                        className="text-green-600 bg-green-50 hover:bg-green-100 rounded-full transition-all w-9 h-9 md:w-10 md:h-10 shadow-sm"
                        title="Audio Call"
                    >
                        <Phone className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-60">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <img src="/avatars/cool_avatar_1.png" className="w-16 h-16 opacity-50 grayscale" alt="Welcome" />
                        </div>
                        <p className="text-center text-slate-500 font-medium">No messages yet.</p>
                        <p className="text-center text-slate-400 text-sm">Send a message to start the conversation!</p>
                    </div>
                )}
                {messages.map((m, index) => {
                    const isMe = m.senderId === currentUserId;
                    // Check if previous message was from same sender
                    const isSequence = index > 0 && messages[index - 1].senderId === m.senderId;

                    return (
                        <div key={m.id} className={cn("flex w-full mb-6", isMe ? "justify-end" : "justify-start")}>
                            <div className={cn("flex max-w-[85%] md:max-w-[70%] gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                                {/* Avatar for 'Them' */}
                                {!isMe && (
                                    <div className="flex flex-col justify-end">
                                        {!isSequence ? (
                                            <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm relative ring-2 ring-white">
                                                {selectedUser.image ? (
                                                    <Image src={selectedUser.image} alt={selectedUser.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 bg-gray-100 text-[10px]">
                                                        {selectedUser.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-8" />
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col gap-1 min-w-0">
                                    <div className={cn(
                                        "p-4 shadow-sm relative group transition-all duration-200",
                                        isMe
                                            ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm"
                                            : "bg-white text-slate-800 border-2 border-slate-100 rounded-2xl rounded-tl-sm",
                                        isSequence && isMe && "rounded-tr-2xl mt-0.5",
                                        isSequence && !isMe && "rounded-tl-2xl mt-0.5"
                                    )}>
                                        {m.attachmentUrl ? (
                                            <>
                                                {renderAttachment(m.attachmentUrl, m.attachmentType)}
                                                {m.content && m.content.startsWith('Shared a') ? null : (
                                                    <p className="mt-2 text-sm opacity-90">{m.content}</p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-[15px] leading-relaxed break-words">{m.content}</p>
                                        )}
                                    </div>

                                    {/* Timestamp below bubble */}
                                    <div className={cn(
                                        "text-[10px] font-medium opacity-60 px-1",
                                        isMe ? "text-right" : "text-left"
                                    )}>
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t relative z-20">
                {showEmojiPicker && (
                    <div className="absolute bottom-24 left-4 z-50 shadow-2xl rounded-2xl border border-slate-100 overflow-hidden" ref={pickerRef}>
                        <EmojiPicker onEmojiClick={handleEmojiClick} width={320} height={400} />
                    </div>
                )}

                <form onSubmit={handleSend} className="flex gap-3 items-end max-w-4xl mx-auto bg-slate-100 p-2 rounded-3xl border border-transparent focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-lg transition-all duration-300">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />

                    <div className="flex gap-1 items-center pl-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-full w-9 h-9 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-yellow-500 hover:bg-yellow-50/50 rounded-full w-9 h-9 transition-colors"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <Smile className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex-1 py-1">
                        <Input
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="border-0 bg-transparent flex-1 focus-visible:ring-0 px-2 h-auto py-1.5 text-slate-700 placeholder:text-slate-400 font-medium"
                        />
                    </div>

                    <Button
                        type="submit"
                        size="icon"
                        className={cn(
                            "h-10 w-10 rounded-full shadow-sm transition-all duration-300 mb-0.5 mr-0.5",
                            !newMessage.trim() && !isUploading
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-md hover:scale-105 active:scale-95"
                        )}
                        disabled={!newMessage.trim() && !isUploading}
                    >
                        <Send className="w-4 h-4 ml-0.5 text-white" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
