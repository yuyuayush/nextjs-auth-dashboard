'use server';

import { db } from "@/drizzle/db";
import { posts } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { inArray, eq, and, or } from "drizzle-orm";
import { shareTokens } from "@/drizzle/schema";
import { utapi } from "@/lib/uploadthing";

export async function deletePosts(postIds: string[]) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    if (!postIds.length) return { success: true };

    // 1. Get posts to find file paths
    const postsToDelete = await db.query.posts.findMany({
        where: (posts, { and, inArray, eq }) => and(
            inArray(posts.id, postIds),
            eq(posts.userId, session.user.id) // Security check
        )
    });

    // 2. Delete files from UploadThing
    await Promise.all(postsToDelete.map(async (post) => {
        try {
            // Extract key from URL (assuming https://utfs.io/f/KEY format)
            const key = post.imageUrl.substring(post.imageUrl.lastIndexOf("/") + 1);
            if (key) await utapi.deleteFiles(key);
        } catch (e) {
            console.error("Failed to delete file from uploadthing", e);
        }
    }));

    // 3. Delete DB records
    await db.delete(posts).where(
        inArray(posts.id, postsToDelete.map(p => p.id))
    );

    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath(`/gallery/${session.user.id}`);

    return { success: true };
}

export async function createPost(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    if (!process.env.UPLOADTHING_TOKEN) {
        return { success: false, error: "Server configuration error: Missing UPLOADTHING_TOKEN" };
    }

    // Get all files with the name "image"
    const files = formData.getAll("image") as File[];
    const caption = formData.get("caption") as string;
    const isPublic = formData.get("isPublic") === "true";

    if (!files || files.length === 0) {
        throw new Error("No images provided");
    }

    let successCount = 0;
    const errors: string[] = [];

    // Process all files in parallel
    await Promise.all(
        files.map(async (file) => {
            if (!file.type.startsWith("image/")) {
                return; // Skip invalid files
            }

            try {
                // Upload to UploadThing
                const response = await utapi.uploadFiles(file);

                if (response.error) {
                    console.error("UploadThing error", response.error);
                    errors.push(response.error.message);
                    return;
                }

                await db.insert(posts).values({
                    userId: session.user.id,
                    imageUrl: response.data.url,
                    caption: caption,
                    isPublic,
                });

                successCount++;
            } catch (e) {
                console.error("Upload exception", e);
                errors.push("Unknown upload error");
            }
        })
    );

    if (successCount === 0) {
        return { success: false, error: errors[0] || "Failed to upload any images" };
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true, count: successCount };
}

export async function getPublicPosts() {
    const allPosts = await db.query.posts.findMany({
        where: (posts, { eq }) => eq(posts.isPublic, true),
        with: {
            user: true
        },
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
    return allPosts;
}



export async function generateShareToken() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    // Check if token already exists
    const existing = await db.query.shareTokens.findFirst({
        where: eq(shareTokens.userId, session.user.id)
    });

    if (existing) return existing.token;

    const token = crypto.randomUUID();
    await db.insert(shareTokens).values({
        userId: session.user.id,
        token
    });

    return token;
}

export async function getUserGalleryPosts(userId: string, token?: string) {
    // 1. Check if token is valid for this user
    let showPrivate = false;
    if (token) {
        const validToken = await db.query.shareTokens.findFirst({
            where: (t, { and, eq }) => and(eq(t.userId, userId), eq(t.token, token))
        });
        if (validToken) showPrivate = true;
    }

    // 2. Fetch posts
    const userPosts = await db.query.posts.findMany({
        where: (posts, { and, eq, or }) => {
            const conditions = [eq(posts.userId, userId)];
            if (!showPrivate) {
                conditions.push(eq(posts.isPublic, true));
            }
            return and(...conditions);
        },
        with: {
            user: true
        },
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
    return { posts: userPosts, isUnlocked: showPrivate };
}

export async function getPublicPostsForUser(userId: string) {
    // Legacy support or redirect to getUserGalleryPosts
    const result = await getUserGalleryPosts(userId);
    return result.posts;
}

export async function getDashboardPosts() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return [];

    const userPosts = await db.query.posts.findMany({
        where: (posts, { eq }) => eq(posts.userId, session.user.id),
        with: {
            user: true
        },
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
    return userPosts;
}
export async function togglePostPrivacy(postId: string, isPublic: boolean) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Check ownership
    const post = await db.query.posts.findFirst({
        where: (posts, { and, eq }) => and(eq(posts.id, postId), eq(posts.userId, session.user.id))
    });

    if (!post) {
        throw new Error("Post not found or unauthorized");
    }

    await db.update(posts)
        .set({ isPublic })
        .where(eq(posts.id, postId));

    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath(`/gallery/${session.user.id}`);

    return { success: true };
}
