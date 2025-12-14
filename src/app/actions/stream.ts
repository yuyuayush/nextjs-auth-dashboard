'use server';

import { StreamClient } from '@stream-io/node-sdk';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error('User is not authenticated');
    }

    if (!apiKey || !apiSecret) {
        // If keys are missing, return a dummy token or error for now
        // This allows UI development to proceed without crashing
        console.error('Stream Keys Missing');
        throw new Error('Stream API Key or Secret is missing');
    }

    const client = new StreamClient(apiKey, apiSecret);
    const exp = Math.round(new Date().getTime() / 1000) + 60 * 60; // 1 hour
    const issued = Math.floor(Date.now() / 1000) - 60;

    const token = client.generateUserToken({
        user_id: session.user.id,
        validity_in_seconds: 60 * 60,
    });

    return token;
};

export const syncUser = async (userId: string, name: string, image?: string) => {
    // Only allow if authenticated (current user can trigger sync for others they want to call? 
    // Ideally we only sync ourselves, but for calling "offline" users, we might need to upsert them as a "user" in Stream)
    // For simplicity/permissions, we'll let any auth user sync a target user they are chatting with.

    // We re-verify session just in case
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) throw new Error('Unauthorized');

    if (!apiKey || !apiSecret) return;

    const client = new StreamClient(apiKey, apiSecret);

    await client.upsertUsers([
        {
            id: userId,
            name: name,
            image: image,
        }
    ]);
};
