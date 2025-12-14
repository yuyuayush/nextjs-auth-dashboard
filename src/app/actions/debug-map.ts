"use server";

import { auth } from "@/lib/auth";
import { db } from "@/drizzle/db";
import { user, friendRequests } from "@/drizzle/schema";
import { headers } from "next/headers";
import { eq, or, and } from "drizzle-orm";

export async function getDebugFriendLocationData() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return { error: "Not authenticated" };
    }

    const userId = session.user.id;
    const userData = await db.query.user.findFirst({
        where: eq(user.id, userId)
    });

    // 1. Get ALL friend requests involving user
    const allRequests = await db.query.friendRequests.findMany({
        where: or(
            eq(friendRequests.senderId, userId),
            eq(friendRequests.receiverId, userId)
        ),
        with: {
            sender: true,
            receiver: true
        }
    });

    // 2. Filter for ACCEPTED
    const accepted = allRequests.filter(r => r.status === 'accepted');

    // 3. Map to friend users
    const friends = accepted.map(r => {
        return r.senderId === userId ? r.receiver : r.sender;
    });

    return {
        me: {
            id: userId,
            name: userData?.name,
            lat: userData?.latitude,
            lng: userData?.longitude
        },
        total_requests: allRequests.length,
        accepted_friends: accepted.length,
        friends_data: friends.map(f => ({
            id: f.id,
            name: f.name,
            has_location: !!(f.latitude && f.longitude),
            lat: f.latitude,
            lng: f.longitude
        }))
    };
}
