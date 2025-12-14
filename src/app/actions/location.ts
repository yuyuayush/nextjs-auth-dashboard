"use server";

import { auth } from "@/lib/auth"; // Adjust import path if needed
import { db } from "@/drizzle/db"; // Adjust import path
import { user, friendRequests } from "@/drizzle/schema"; // Adjust import path
import { headers } from "next/headers";
import { eq, or, and } from "drizzle-orm";

export async function updateUserLocation(latitude: number, longitude: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    await db
        .update(user)
        .set({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
        })
        .where(eq(user.id, session.user.id));

    return { success: true };
}

export async function getFriendsLocations() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Find all accepted friend requests where the user is either sender or receiver
    const friends = await db.query.friendRequests.findMany({
        where: and(
            eq(friendRequests.status, "accepted"),
            or(
                eq(friendRequests.senderId, userId),
                eq(friendRequests.receiverId, userId)
            )
        ),
        with: {
            sender: true,
            receiver: true
        }
    });

    console.log(`[DEBUG] Found ${friends.length} accepted friendships for user ${userId}`);

    // Map to get the *other* user
    const friendUsers = friends.map((f) => {
        const friend = f.senderId === userId ? f.receiver : f.sender;
        console.log(`[DEBUG] Friend: ${friend.name} (${friend.id}) - Lat: ${friend.latitude}, Long: ${friend.longitude}`);
        return friend;
    }).filter((u) => {
        const hasLoc = u.latitude && u.longitude;
        if (!hasLoc) console.log(`[DEBUG] Skipping friend ${u.name} (no location)`);
        return hasLoc;
    });

    return friendUsers.map(u => ({
        id: u.id,
        name: u.name,
        image: u.image,
        latitude: parseFloat(u.latitude!),
        longitude: parseFloat(u.longitude!),
    }));
}

export async function getMyLocation() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) return null;

    const currentUser = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
    });

    if (currentUser && currentUser.latitude && currentUser.longitude) {
        return {
            latitude: parseFloat(currentUser.latitude),
            longitude: parseFloat(currentUser.longitude),
            image: currentUser.image,
            name: currentUser.name
        };
    }
    return null;
}
