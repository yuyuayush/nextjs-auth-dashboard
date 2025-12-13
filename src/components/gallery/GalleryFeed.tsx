'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import ImageModal from './ImageModal';
import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { deletePosts } from '@/app/actions/post';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
    isPublic: boolean;
    createdAt: Date;
    user: PostUser;
}

export default function GalleryFeed({ posts }: { posts: Post[] }) {
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const { data: session } = useSession();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (e: React.MouseEvent, postId: string) => {
        e.stopPropagation(); // Prevent opening the modal
        if (!confirm("Are you sure you want to delete this post?")) return;

        setIsDeleting(postId);
        try {
            const result = await deletePosts([postId]);
            if (result?.success) {
                toast.success("Post deleted successfully");
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to delete post");
            console.error(error);
        } finally {
            setIsDeleting(null);
        }
    };

    if (posts.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-gray-500 text-lg">No posts yet. Be the first to share!</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {posts.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group relative"
                    >
                        {/* Make the main card click open the modal */}
                        <div onClick={() => setSelectedPost(post)} className="cursor-pointer">
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                <Image
                                    src={post.imageUrl}
                                    alt={post.caption || 'Gallery Image'}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {session?.user?.id === post.userId && (
                                    <button
                                        onClick={(e) => handleDelete(e, post.id)}
                                        disabled={isDeleting === post.id}
                                        className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        title="Delete Post"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 relative">
                                        {post.user.image ? (
                                            <Image src={post.user.image} alt={post.user.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                {post.user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{post.user.name}</span>
                                </div>
                                {post.caption && (
                                    <p className="text-gray-600 text-sm line-clamp-2">{post.caption}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <ImageModal
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                post={selectedPost}
            />
        </>
    );
}
