
import { db } from "@/drizzle/db";
import { posts, user } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Globe, Calendar } from "lucide-react";
import ProfilePostGrid from "@/components/profile/ProfilePostGrid";

export default async function PublicUserProfilePage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const userProfile = await db.query.user.findFirst({
        where: eq(user.id, id),
    });

    if (!userProfile) {
        notFound();
    }

    const userPosts = await db.query.posts.findMany({
        where: and(
            eq(posts.userId, id),
            eq(posts.isPublic, true)
        ),
        orderBy: [desc(posts.createdAt)],
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Cover Area */}
            <div className="bg-white border-b">
                <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {/* Avatar */}
                        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                            {userProfile.image ? (
                                <img src={userProfile.image} alt={userProfile.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-4xl font-bold">
                                    {userProfile.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{userProfile.name}</h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                                    <Globe className="w-4 h-4 text-blue-500" />
                                    <span>Public Profile</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>Joined {new Date(userProfile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                                </div>
                                {userProfile.birthday && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-gray-400">🎉</span>
                                        <span>{new Date(userProfile.birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                                    </div>
                                )}
                                {userProfile.address && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-gray-400">📍</span>
                                        <span>{userProfile.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 md:mt-0">
                            <Link href="/" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                Visit Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span>Public Posts</span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{userPosts.length}</span>
                </h2>

                {userPosts.length > 0 ? (
                    <ProfilePostGrid user={userProfile} posts={userPosts} />
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Globe className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No public posts yet</h3>
                        <p className="text-gray-500">This user hasn't shared anything publicly.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
