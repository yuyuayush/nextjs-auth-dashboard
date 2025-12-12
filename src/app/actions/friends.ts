'use server';

import { db } from "@/drizzle/db";
import { friendRequests, user } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, eq, or, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// SEND Friend Request
export async function sendFriendRequest(receiverId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    await db.insert(friendRequests).values({
        senderId: session.user.id,
        receiverId,
        status: "pending",
    });

    revalidatePath("/chat");
    return { success: true };
}

// ACCEPT Request
export async function acceptFriendRequest(requestId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    await db.update(friendRequests)
        .set({ status: "accepted" })
        .where(and(eq(friendRequests.id, requestId), eq(friendRequests.receiverId, session.user.id)));

    revalidatePath("/chat");
    return { success: true };
}

// REJECT Request
export async function rejectFriendRequest(requestId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    await db.update(friendRequests)
        .set({ status: "rejected" })
        .where(and(eq(friendRequests.id, requestId), eq(friendRequests.receiverId, session.user.id)));

    revalidatePath("/chat");
    return { success: true };
}

// GET All Users + Status
export async function getAllUsersWithStatus() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return [];

    const currentUserId = session.user.id;

    // 1. Get all users (except self)
    const allUsers = await db.select().from(user).where(ne(user.id, currentUserId));

    // 2. Get all requests involving current user
    const requests = await db.query.friendRequests.findMany({
        where: or(
            eq(friendRequests.senderId, currentUserId),
            eq(friendRequests.receiverId, currentUserId)
        )
    });

    // 3. Map status to users
    return allUsers.map(u => {
        const req = requests.find(r =>
            (r.senderId === currentUserId && r.receiverId === u.id) ||
            (r.receiverId === currentUserId && r.senderId === u.id)
        );

        let status: 'none' | 'pending_sent' | 'pending_received' | 'accepted' = 'none';

        if (req) {
            if (req.status === 'accepted') {
                status = 'accepted';
            } else if (req.status === 'pending') {
                status = req.senderId === currentUserId ? 'pending_sent' : 'pending_received';
            }
        }

        return {
            ...u,
            friendStatus: status,
            requestId: req?.id
        };
    });
}

// GET Accepted Friends only (for Chat list)
export async function getFriends() {
    const usersWithStatus = await getAllUsersWithStatus();
    return usersWithStatus.filter(u => u.friendStatus === 'accepted');
}

// GET Incoming Pending Requests
export async function getPendingRequests() {
    const usersWithStatus = await getAllUsersWithStatus();
    return usersWithStatus.filter(u => u.friendStatus === 'pending_received');
}
