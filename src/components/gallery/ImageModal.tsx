'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    caption?: string | null;
    user?: { name: string };
    createdAt?: Date;
}

export default function ImageModal({ isOpen, onClose, imageUrl, caption, user, createdAt }: ImageModalProps) {
    if (!isOpen) return null;

    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl);
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
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this image!',
                    text: caption || 'Awesome image from the gallery',
                    url: window.location.href, // Or specific image link if we had a dedicated page per image
                });
                toast.success("Shared successfully");
            } catch (error) {
                console.log("Error sharing", error);
            }
        } else {
            await navigator.clipboard.writeText(window.location.origin + imageUrl);
            toast.success("Image link copied to clipboard");
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
                                    src={imageUrl}
                                    alt={caption || 'Full size image'}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        {/* Sidebar / Info (Optional, but nice for "Bigger Frame") */}
                        <div className="bg-white w-full md:w-80 p-6 flex flex-col justify-between shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {user?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{user?.name}</p>
                                        {createdAt && <p className="text-xs text-gray-500">{new Date(createdAt).toLocaleDateString()}</p>}
                                    </div>
                                </div>

                                {caption && (
                                    <div className="mb-6">
                                        <p className="text-gray-700 leading-relaxed">{caption}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mt-auto">
                                <Button onClick={handleDownload} variant="outline" className="w-full flex items-center gap-2">
                                    <Download className="w-4 h-4" /> Download
                                </Button>
                                <Button onClick={handleShare} className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                                    <Share2 className="w-4 h-4" /> Share
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
