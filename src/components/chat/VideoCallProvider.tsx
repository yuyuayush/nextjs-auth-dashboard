'use client';

import { StreamVideo, StreamVideoClient, User } from '@stream-io/video-react-sdk';
import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { tokenProvider } from '@/app/actions/stream';
import CallLayout from './CallLayout';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export default function VideoCallProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

    useEffect(() => {
        if (!session?.user || !apiKey) return;

        const user: User = {
            id: session.user.id,
            name: session.user.name,
            image: session.user.image || undefined,
        };

        const client = new StreamVideoClient({
            apiKey,
            user,
            tokenProvider,
        });

        setVideoClient(client);

        return () => {
            client.disconnectUser();
            setVideoClient(null);
        };
    }, [session]);

    if (!videoClient) {
        if (!apiKey) return <>{children}</>;
        return <>{children}</>;
    }

    return (
        <StreamVideo client={videoClient}>
            <CallLayout />
            {children}
        </StreamVideo>
    );
}
