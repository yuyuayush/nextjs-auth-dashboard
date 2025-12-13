'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Globe, Lock, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { togglePostPrivacy, deletePosts, generateShareToken } from '@/app/actions/post';
import { useRouter } from 'next/navigation';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: {
        id: string;
        userId: string;
        imageUrl: string;
        caption?: string | null;
        isPublic?: boolean;
        createdAt: Date;
        user: { name: string; image?: string | null };
    } | null;
}

export default function ImageModal({ isOpen, onClose, post }: ImageModalProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isPublic, setIsPublic] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (post) {
            setIsPublic(post.isPublic || false);
        }
    }, [post]);

    if (!isOpen || !post) return null;

    const isOwner = session?.user?.id === post.userId;

    const handleDownload = async () => {
        try {
            const response = await fetch(post.imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `image-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Download started");
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download image");
        }
    };

    const handleShare = async () => {
        let text = post.caption || 'Check out this image!';
        let url = window.location.href;

        if (!isPublic && isOwner) {
            try {
                toast.loading("Generating link...");
                const token = await generateShareToken();
                url = `${window.location.origin}/gallery/${post.userId}?token=${token}`;
                text = `Check out my private gallery!`;
                toast.dismiss();
            } catch (e) {
                toast.dismiss();
                toast.error("Failed to generate link");
                return;
            }
        }

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Image Share', text, url });
                toast.success("Shared successfully");
            } catch (error) {
                console.log("Error sharing", error);
            }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard");
        }
    };

    const handlePrivacyToggle = async () => {
        setIsUpdating(true);
        try {
            const newStatus = !isPublic;
            const result = await togglePostPrivacy(post.id, newStatus);
            if (result.success) {
                setIsPublic(newStatus);
                toast.success(newStatus ? "Post is now public" : "Post is now private");
            }
        } catch (error) {
            toast.error("Failed to update privacy");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = () => setShowDeleteConfirm(true);

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deletePosts([post.id]);
            if (result.success) {
                toast.success("Post deleted");
                onClose();
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete post");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xl p-4 overflow-y-auto" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col ring-1 ring-white/10 my-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button - Floating */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            onClick={onClose}
                            className="absolute top-6 right-6 z-50 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95 group"
                        >
                            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        </motion.button>

                        {/* Image Section - Cinematic */}
                        <div className="w-full relative bg-black/95 group flex flex-col items-center justify-center">
                            <div className="relative w-full h-[50vh] md:h-[70vh] bg-zinc-950">
                                <Image
                                    src={post.imageUrl}
                                    alt={post.caption || 'Full view'}
                                    fill
                                    className="object-contain"
                                    quality={100}
                                    priority
                                />
                            </div>
                        </div>

                        {/* Details Section - Clean & Modern */}
                        <div className="w-full bg-white flex flex-col p-6 md:p-8 xl:p-10">
                            <div className="max-w-4xl mx-auto w-full">
                                {/* Header: User Info & Meta */}
                                <div className="flex items-start justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-50 shadow-sm">
                                            {post.user.image ? (
                                                <Image src={post.user.image} alt={post.user.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold bg-blue-50 text-xl">
                                                    {post.user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg tracking-tight">{post.user.name}</h3>
                                            <p className="text-sm text-gray-500 font-medium">{new Date(post.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</p>
                                        </div>
                                    </div>

                                    {/* Desktop Quick Actions */}
                                    <div className="hidden md:flex gap-3">
                                        <Button
                                            onClick={handleDownload}
                                            variant="outline"
                                            className="rounded-full border-gray-200 hover:bg-gray-50 hover:border-gray-300 h-10 px-5"
                                        >
                                            <Download className="w-4 h-4 mr-2" /> Download
                                        </Button>
                                        <Button
                                            onClick={handleShare}
                                            className="rounded-full bg-zinc-900 text-white hover:bg-black h-10 px-5 shadow-lg shadow-zinc-900/10"
                                        >
                                            <Share2 className="w-4 h-4 mr-2" /> Share
                                        </Button>
                                    </div>
                                </div>

                                {/* Caption & Content */}
                                <div className="mb-10 pl-1">
                                    <p className="text-gray-700 text-lg leading-relaxed font-light">
                                        {post.caption || <span className="text-gray-300 italic">No caption provided.</span>}
                                    </p>
                                </div>

                                {/* Privacy & Delete Actions */}
                                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className={cn(
                                            "flex items-center gap-2.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                                            isPublic
                                                ? "bg-green-50 border-green-100 text-green-700"
                                                : "bg-amber-50 border-amber-100 text-amber-700"
                                        )}>
                                            {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                            {isPublic ? "Public Visible" : "Private Only"}
                                        </div>
                                    </div>

                                    {/* Mobile Actions */}
                                    <div className="grid grid-cols-2 gap-3 w-full md:hidden">
                                        <Button onClick={handleDownload} variant="outline" className="w-full rounded-xl h-11">
                                            <Download className="w-4 h-4 mr-2" /> Save
                                        </Button>
                                        <Button onClick={handleShare} className="w-full rounded-xl bg-zinc-900 h-11">
                                            <Share2 className="w-4 h-4 mr-2" /> Share
                                        </Button>
                                    </div>

                                    {isOwner && (
                                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                            <div className="h-4 w-px bg-gray-200 mx-2 hidden md:block" />

                                            <Button
                                                variant="ghost"
                                                onClick={handlePrivacyToggle}
                                                disabled={isUpdating}
                                                className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full px-4"
                                            >
                                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (isPublic ? <Lock className="w-4 h-4 mr-2" /> : <Globe className="w-4 h-4 mr-2" />)}
                                                {isPublic ? "Make Private" : "Make Public"}
                                            </Button>

                                            {showDeleteConfirm ? (
                                                <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-full border border-red-100 animate-in slide-in-from-right-2">
                                                    <span className="text-xs text-red-600 font-medium px-3">Confirm?</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                        className="h-7 w-7 rounded-full p-0 text-red-600 hover:bg-red-100"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={confirmDelete}
                                                        disabled={isDeleting}
                                                        className="h-7 px-3 rounded-full text-xs"
                                                    >
                                                        Yes
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    onClick={handleDeleteClick}
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full px-4"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

import { cn } from '@/lib/utils';
