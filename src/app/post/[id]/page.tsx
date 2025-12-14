import { db } from "@/drizzle/db";
import { posts, user } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function PublicPostPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const post = await db.query.posts.findFirst({
        where: eq(posts.id, id),
        with: {
            user: true,
        },
    });

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full">
                <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {post.user.image ? (
                            <img src={post.user.image} alt={post.user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {post.user.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">{post.user.name}</h1>
                            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                        Go to App
                    </Link>
                </div>

                <div className="relative w-full aspect-video bg-black">
                    <Image
                        src={post.imageUrl}
                        alt={post.caption || "Post image"}
                        fill
                        className="object-contain"
                    />
                </div>

                <div className="p-6">
                    <p className="text-gray-800 text-lg">{post.caption}</p>
                </div>
            </div>
        </div>
    );
}
