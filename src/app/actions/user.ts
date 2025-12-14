"use server";

import { auth } from "@/lib/auth";
import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function updateUserAvatar(imageUrl: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    await db
        .update(user)
        .set({
            image: imageUrl,
        })
        .where(eq(user.id, session.user.id));

    return { success: true };
}
