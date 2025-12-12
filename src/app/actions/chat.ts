'use server';

import { db } from "@/drizzle/db";
import { messages, user } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { or, and, eq, asc, ne } from "drizzle-orm";

export async function getUsers() {
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

export async function sendMessage(receiverId: string, content: string) {
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
    });

    return { success: true };
}

export async function getMessages(otherUserId: string) {
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
