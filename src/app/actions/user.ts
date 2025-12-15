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

export async function updateUserName(name: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    await db
        .update(user)
        .set({
            name: name,
        })
        .where(eq(user.id, session.user.id));

    return { success: true };
}

export async function updateUserDetails(data: { name?: string; birthday?: Date; address?: string }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    await db
        .update(user)
        .set({
            ...(data.name && { name: data.name }),
            ...(data.birthday && { birthday: data.birthday }),
            ...(data.address && { address: data.address }),
        })
        .where(eq(user.id, session.user.id));

    return { success: true };
}

export async function getUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return null;
    }

    const userData = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
    });

    return userData;
}

import { utapi } from "@/lib/uploadthing";

export async function uploadAvatar(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const file = formData.get("file") as File;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    try {
        const response = await utapi.uploadFiles(file);

        if (response.error) {
            return { success: false, error: response.error.message };
        }

        return { success: true, url: response.data.url };

    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Upload failed" };
    }
}
