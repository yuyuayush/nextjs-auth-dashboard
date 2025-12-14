'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle } from 'lucide-react';
import ImageModal from '@/components/gallery/ImageModal';

interface ProfilePostGridProps {
    user: {
        id: string;
        name: string;
        image?: string | null;
    };
    posts: {
        id: string;
        userId: string;
        imageUrl: string;
        caption: string | null;
        isPublic: boolean;
        createdAt: Date;
    }[];
}

export default function ProfilePostGrid({ user, posts }: ProfilePostGridProps) {
    const [selectedPost, setSelectedPost] = useState<any | null>(null);

    const handlePostClick = (post: any) => {
        // Enrich post with user data for the modal
        setSelectedPost({
            ...post,
            user: user
        });
    };

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                    <div 
                        key={post.id} 
                        onClick={() => handlePostClick(post)}
                        className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                    >
                        <Image
                            src={post.imageUrl}
                            alt={post.caption || "Post"}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* <div className="flex text-white font-bold gap-4">
                                Future: Like/Comment counts
                            </div> */}
                        </div>

                        {post.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-sm truncate">{post.caption}</p>
                            </div>
                        )}
                    </div>
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
