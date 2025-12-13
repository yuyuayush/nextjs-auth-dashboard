'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Globe, Lock, LayoutGrid, List as ListIcon, Trash2, Download, CheckSquare, Square } from 'lucide-react';
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
        }
    };

    const handleDownload = async () => {
        const selectedPosts = posts.filter(p => selectedIds.has(p.id));
        toast.info(`Starting download for ${selectedPosts.length} items...`);

        // Simple loop download for now
        for (const post of selectedPosts) {
            const a = document.createElement('a');
            a.href = post.imageUrl;
            a.download = `image-${post.id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            await new Promise(r => setTimeout(r, 200)); // Small delay to prevent browser blocking
        }
    };

    if (posts.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">You haven't uploaded any photos yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={cn(viewMode === 'grid' && "bg-gray-100 text-blue-600")}
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" /> Grid
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={cn(viewMode === 'list' && "bg-gray-100 text-blue-600")}
                    >
                        <ListIcon className="w-4 h-4 mr-2" /> List
                    </Button>
                </div>

                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5">
                        <span className="text-sm font-medium text-gray-600 mr-2">
                            {selectedIds.size} selected
                        </span>
                        <Button size="sm" variant="outline" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                    </div>
                )}
            </div>

            {/* List Header (Only for List Mode) */}
            {viewMode === 'list' && (
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-500 border-b">
                    <div className="col-span-1 flex items-center">
                        <Checkbox
                            checked={selectedIds.size === posts.length && posts.length > 0}
                            onCheckedChange={toggleAll}
                        />
                    </div>
                    <div className="col-span-2">Image</div>
                    <div className="col-span-5">Caption</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Privacy</div>
                </div>
            )}

            {/* Content */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={cn(
                                "bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative border-2",
                                selectedIds.has(post.id) ? "border-blue-500 ring-2 ring-blue-100" : "border-transparent"
                            )}
                        >
                            <div className="absolute top-2 left-2 z-20">
                                <Checkbox
                                    checked={selectedIds.has(post.id)}
                                    onCheckedChange={() => toggleSelection(post.id)}
                                    className="bg-white/80 backdrop-blur-sm border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                            </div>

                            <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm" title={post.isPublic ? "Public" : "Private"}>
                                {post.isPublic ? <Globe className="w-3 h-3 text-blue-500" /> : <Lock className="w-3 h-3 text-gray-500" />}
                            </div>

                            <div
                                className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                                onClick={() => setSelectedPost(post)}
                            >
                                <Image
                                    src={post.imageUrl}
                                    alt={post.caption || 'Gallery Image'}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-4">
                                {post.caption ? (
                                    <p className="text-gray-900 text-sm font-medium line-clamp-2">{post.caption}</p>
                                ) : (
                                    <p className="text-gray-400 text-sm italic">No caption</p>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border divide-y">
                    {posts.map((post) => (
                        <div key={post.id} className={cn("grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors", selectedIds.has(post.id) && "bg-blue-50/50")}>
                            <div className="col-span-1">
                                <Checkbox
                                    checked={selectedIds.has(post.id)}
                                    onCheckedChange={() => toggleSelection(post.id)}
                                />
                            </div>
                            <div className="col-span-2 relative h-16 w-24 rounded-lg overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setSelectedPost(post)}>
                                <Image src={post.imageUrl} alt="Thumb" fill className="object-cover" />
                            </div>
                            <div className="col-span-5 text-sm font-medium text-gray-900 truncate pr-4">
                                {post.caption || <span className="text-gray-400 italic">No caption</span>}
                            </div>
                            <div className="col-span-2 text-sm text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                            <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                                {post.isPublic ? (
                                    <><Globe className="w-3 h-3 text-blue-500" /> Public</>
                                ) : (
                                    <><Lock className="w-3 h-3 text-gray-500" /> Private</>
                                )}
                            </div>
                        </div>
                    ))}
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
