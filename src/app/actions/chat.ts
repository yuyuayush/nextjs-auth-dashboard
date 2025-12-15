'use server';

import { db } from "@/drizzle/db";
import { messages, user } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { or, and, eq, asc, ne } from "drizzle-orm";
import { utapi } from "@/lib/uploadthing";

export async function getUsers() {
    // ... same code ...
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return [];
    }

    // Return all users except self
    const allUsers = await db.select().from(user).where(ne(user.id, session.user.id));
    return allUsers;
}

export async function sendMessage(receiverId: string, content: string, attachmentUrl?: string, attachmentType?: string) {
    // ... same code ...
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    await db.insert(messages).values({
        senderId: session.user.id,
        receiverId,
        content,
        attachmentUrl,
        attachmentType
    });

    return { success: true };
}

export async function getMessages(otherUserId: string) {
    // ... same code ...
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const currentUserId = session.user.id;

    // Fetch messages between current user and other user
    const chatMessages = await db.query.messages.findMany({
        where: or(
            and(eq(messages.senderId, currentUserId), eq(messages.receiverId, otherUserId)),
            and(eq(messages.senderId, otherUserId), eq(messages.receiverId, currentUserId))
        ),
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        with: {
            sender: true
        }
    });

    return chatMessages;
}

export async function uploadChatAttachment(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    if (!process.env.UPLOADTHING_TOKEN) {
        throw new Error("Server configuration error: Missing UPLOADTHING_TOKEN");
    }

    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    // Upload to UploadThing
    const response = await utapi.uploadFiles(file);

    if (response.error) {
        throw new Error(response.error.message);
    }

    let type = 'document';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';

    return { url: response.data.url, type };
}

export async function searchUsers(query: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const matchedUsers = await db.query.user.findMany({
        where: and(
            ne(user.id, session.user.id),
            // ILIKE is not directly available in all drizzle drivers via 'ilike', but typically accessible via operators or raw sql.
            // For simplicity with standard drizzle operators if ilike isn't exported:
            // Actually, we can use sql template or just standard text search if available.
            // Let's assume standard 'like' or check if we can import ilike. 
            // If not, we can use sql`lower(${user.name}) like lower(${'%' + query + '%'})`
        ),
        limit: 10
    });

    // Simple filter since DrizzleORM might need specific operator imports for ILIKE depending on driver
    // Better to filter in DB but fallback to memory for small prototype if needed.
    // Let's try fetching all (limited) or just use SQL operator.

    // Re-writing with sql operator for safety:
    const { ilike } = await import("drizzle-orm");
    const results = await db.select().from(user).where(
        and(
            ne(user.id, session.user.id),
            ilike(user.name, `%${query}%`)
        )
    ).limit(10);

    return results;
}
