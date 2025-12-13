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
        user: { name: string };
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
        let text = post.caption || 'Awesome image from the gallery';
        let url = window.location.href;

        // If private and owner, generate share token
        if (!isPublic && isOwner) {
            try {
                toast.loading("Generating share link...");
                const token = await generateShareToken();
                url = `${window.location.origin}/gallery/${post.userId}?token=${token}`;
                text = `Check out my private gallery!`;
                toast.dismiss();
            } catch (e) {
                toast.dismiss();
                toast.error("Failed to generate share link");
                return;
            }
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this image!',
                    text: text,
                    url: url,
                });
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

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deletePosts([post.id]);
            if (result.success) {
                toast.success("Post deleted successfully");
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative max-w-5xl w-full max-h-[90vh] bg-transparent rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Image Container */}
                        <div className="flex-1 relative bg-black flex items-center justify-center min-h-[50vh] md:min-h-full">
                            <div className="relative w-full h-full min-h-[50vh]">
                                <Image
                                    src={post.imageUrl}
                                    alt={post.caption || 'Full size image'}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="bg-white w-full md:w-80 p-6 flex flex-col justify-between shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {post.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{post.user.name}</p>
                                        <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {post.caption && (
                                    <div className="mb-6">
                                        <p className="text-gray-700 leading-relaxed">{post.caption}</p>
                                    </div>
                                )}

                                {/* Privacy Status / Toggle */}
                                <div className="mb-6 p-4 rounded-lg bg-gray-50 border">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Visibility</span>
                                        {isPublic ? (
                                            <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                                <Globe className="w-3 h-3 mr-1" /> Public
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                                <Lock className="w-3 h-3 mr-1" /> Private
                                            </span>
                                        )}
                                    </div>

                                    {isOwner && (
                                        <Button
                                            onClick={handlePrivacyToggle}
                                            disabled={isUpdating}
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs h-8"
                                        >
                                            {isUpdating ? (
                                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                            ) : (
                                                isPublic ? <Lock className="w-3 h-3 mr-2" /> : <Globe className="w-3 h-3 mr-2" />
                                            )}
                                            {isUpdating ? "Updating..." : (isPublic ? "Make Private" : "Make Public")}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-auto">
                                {showDeleteConfirm ? (
                                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                        <p className="text-sm text-red-800 font-medium mb-3 text-center">
                                            Delete this post permanently?
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="flex-1 bg-white hover:bg-red-50 text-red-700 border-red-200"
                                                size="sm"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={confirmDelete}
                                                disabled={isDeleting}
                                                className="flex-1"
                                                size="sm"
                                            >
                                                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Button onClick={handleDownload} variant="outline" className="w-full flex items-center gap-2">
                                            <Download className="w-4 h-4" /> Download
                                        </Button>
                                        <Button onClick={handleShare} className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                                            <Share2 className="w-4 h-4" /> Share
                                        </Button>
                                        {isOwner && (
                                            <Button
                                                onClick={handleDeleteClick}
                                                variant="destructive"
                                                className="w-full flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete Post
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
