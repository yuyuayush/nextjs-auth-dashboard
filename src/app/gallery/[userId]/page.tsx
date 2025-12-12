
import { notFound } from "next/navigation";
import { getUserGalleryPosts } from "@/app/actions/post";
import GalleryFeed from "@/components/gallery/GalleryFeed";
import LandingHero from "@/components/landing/LandingHero";
import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { LockOpen } from "lucide-react";

interface PageProps {
    params: Promise<{ userId: string }>;
    searchParams: Promise<{ token?: string }>;
}

export default async function UserPublicGallery({ params, searchParams }: PageProps) {
    const { userId } = await params;
    const { token } = await searchParams;

    // Fetch user details first
    const userResult = await db.query.user.findFirst({
        where: eq(user.id, userId)
    });

    if (!userResult) {
        notFound();
    }

    const { posts, isUnlocked } = await getUserGalleryPosts(userId, token);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Simple Header for Profile */}
            <div className="bg-white border-b shadow-sm py-12 mb-8">
                <div className="container mx-auto px-4 text-center">
                    <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 mb-4 overflow-hidden relative">
                        {userResult.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={userResult.image} alt={userResult.name} className="w-full h-full object-cover" />
                        ) : (
                            userResult.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{userResult.name}&apos;s Gallery</h1>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <p className="text-gray-500">
                            {isUnlocked ? "Full Access Unlocked" : "Public showcase"}
                        </p>
                        {isUnlocked && <LockOpen className="w-4 h-4 text-amber-600" />}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {posts.length > 0 ? (
                    <GalleryFeed posts={posts} />
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500">This user hasn&apos;t shared any public photos yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
