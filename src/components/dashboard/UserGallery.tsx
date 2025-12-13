'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Globe, Lock, LayoutGrid, List as ListIcon, Trash2, Download, CheckSquare, Square, X } from 'lucide-react';
import { useState } from 'react';
import ImageModal from '@/components/gallery/ImageModal';
import { Button } from '@/components/ui/button';
import { deletePosts } from '@/app/actions/post';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PostUser {
    name: string;
    image?: string | null;
}

interface Post {
    id: string;
    userId: string;
    imageUrl: string;
    caption: string | null;
    createdAt: Date;
    user: PostUser;
    isPublic: boolean;
}

export default function UserGallery({ posts }: { posts: Post[] }) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleAll = () => {
        if (selectedIds.size === posts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(posts.map(p => p.id)));
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) return;

        setIsDeleting(true);
        try {
            await deletePosts(Array.from(selectedIds));
            toast.success("Items deleted successfully");
            setSelectedIds(new Set());
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete items");
        } finally {
            setIsDeleting(false);
            // setViewMode('grid'); // Reset check
        }
    };

    const handleDownload = async () => {
        const selectedPosts = posts.filter(p => selectedIds.has(p.id));
        toast.info(`Starting download for ${selectedPosts.length} items...`);

        for (const post of selectedPosts) {
            const a = document.createElement('a');
            a.href = post.imageUrl;
            a.download = `image-${post.id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            await new Promise(r => setTimeout(r, 200));
        }
    };

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <LayoutGrid className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gallery is empty</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                    Upload photos to create your personal collection. Your memories will appear here.
                </p>
                <Button className="mt-8" onClick={() => router.push('/dashboard/upload')}>Upload Now</Button>
            </div>
        );
    }

    return (
        <div className="relative min-h-[500px]">
            {/* View Toggle & Count */}
            <div className="flex justify-between items-center mb-8 sticky top-0 z-30 py-4 bg-neutral-100/95 backdrop-blur-sm supports-[backdrop-filter]:bg-neutral-100/60 transition-all">
                <p className="text-xl font-bold text-gray-900 tracking-tight">
                    {posts.length} <span className="text-gray-500 font-normal text-base ml-1">{posts.length === 1 ? 'Photo' : 'Photos'}</span>
                </p>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200/50">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-2.5 rounded-lg transition-all text-sm flex items-center gap-2",
                            viewMode === 'grid' ? "bg-gray-100/80 text-gray-900 font-medium shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2.5 rounded-lg transition-all text-sm flex items-center gap-2",
                            viewMode === 'list' ? "bg-gray-100/80 text-gray-900 font-medium shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <ListIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            layoutId={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn(
                                "group relative aspect-[3/4] w-full rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 bg-gray-100",
                                selectedIds.has(post.id) ? "ring-4 ring-blue-500 ring-offset-4" : "hover:-translate-y-2"
                            )}
                            onClick={() => {
                                if (selectedIds.size > 0) {
                                    toggleSelection(post.id);
                                } else {
                                    setSelectedPost(post);
                                }
                            }}
                        >
                            {/* Full Background Image */}
                            <Image
                                src={post.imageUrl}
                                alt={post.caption || 'Gallery Image'}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />

                            {/* Gradient Protection for Text Visibility at top (optional) */}
                            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/40 to-transparent opacity-60 pointer-events-none" />

                            {/* Selection & Privacy Controls (Top) */}
                            <div className="absolute top-5 right-5 z-20 flex flex-col gap-3 transition-opacity">
                                <div onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedIds.has(post.id)}
                                        onCheckedChange={() => toggleSelection(post.id)}
                                        className="w-7 h-7 rounded-full border-2 border-white/40 bg-white/20 backdrop-blur-md data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all shadow-lg"
                                    />
                                </div>
                            </div>
                            <div className="absolute top-5 left-5 z-20">
                                {post.isPublic ? (
                                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-lg">
                                        <Globe className="w-4 h-4 text-white" />
                                    </div>
                                ) : (
                                    <div className="bg-black/20 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-lg">
                                        <Lock className="w-4 h-4 text-white/80" />
                                    </div>
                                )}
                            </div>

                            {/* Glassmorphic Content Overlay (Bottom) */}
                            <div className="absolute bottom-0 inset-x-0 bg-white/10 backdrop-blur-xl border-t border-white/20 p-5 flex flex-col gap-3 transition-transform duration-300">
                                {/* Text Content */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-white shadow-black/10 drop-shadow-md truncate">
                                            {post.user.name}
                                        </h3>
                                        {/* Verified Badge Mock */}
                                        <div className="bg-green-500 rounded-full p-0.5 shadow-sm shrink-0">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed line-clamp-2 font-medium">
                                        {post.caption || "No description provided."}
                                    </p>
                                </div>

                                {/* Footer Stats */}
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-3 text-white/90 text-xs font-semibold">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-sm">{new Date().getMonth() + 1}k</span>
                                            <span className="opacity-80">Views</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-80">
                                            <LayoutGrid className="w-3.5 h-3.5" />
                                            <span>{new Date(post.createdAt).getDate()}</span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="rounded-[1rem] px-4 h-8 text-xs font-bold bg-white text-black hover:bg-white/90 shadow-lg border-0 transition-transform active:scale-95"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPost(post);
                                        }}
                                    >
                                        View
                                    </Button>
                                </div>
                            </div>

                            {/* Selected Overlay */}
                            {selectedIds.has(post.id) && (
                                <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] z-10 pointer-events-none border-[3px] border-blue-500 rounded-[2rem]" />
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-1">
                            <Checkbox
                                checked={selectedIds.size === posts.length && posts.length > 0}
                                onCheckedChange={toggleAll}
                            />
                        </div>
                        <div className="col-span-2">Preview</div>
                        <div className="col-span-1">Public</div>
                        <div className="col-span-5">Details</div>
                        <div className="col-span-3 text-right">Added</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className={cn(
                                    "grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors cursor-pointer group hover:bg-gray-50/80",
                                    selectedIds.has(post.id) && "bg-blue-50/40"
                                )}
                                onClick={() => setSelectedPost(post)}
                            >
                                <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedIds.has(post.id)}
                                        onCheckedChange={() => toggleSelection(post.id)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-gray-100 shadow-sm ring-1 ring-gray-200">
                                        <Image src={post.imageUrl} alt="Thumb" fill className="object-cover" />
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    {post.isPublic ? (
                                        <Globe className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Lock className="w-4 h-4 text-amber-500" />
                                    )}
                                </div>
                                <div className="col-span-5">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {post.caption || <span className="text-gray-400 italic">No caption</span>}
                                    </p>
                                </div>
                                <div className="col-span-3 text-right text-sm text-gray-500">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Floating Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white rounded-full shadow-2xl border border-gray-100 p-2 flex items-center gap-2 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium shadow-sm">
                        {selectedIds.size} Selected
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1" />
                    <Button variant="ghost" size="sm" onClick={handleDownload} className="rounded-full hover:bg-gray-100 text-gray-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <div className="h-6 w-px bg-gray-200 mx-1" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="rounded-full hover:bg-red-50 text-red-600 hover:text-red-700"
                    >
                        {isDeleting ? <span className="animate-spin mr-2">⏳</span> : <Trash2 className="w-4 h-4 mr-2" />}
                        Delete
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedIds(new Set())} className="rounded-full w-8 h-8 ml-1 hover:bg-gray-100">
                        <X className="w-4 h-4 text-gray-400" />
                    </Button>
                </div>
            )}

            <ImageModal
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                post={selectedPost}
            />
        </div>
    );
}
