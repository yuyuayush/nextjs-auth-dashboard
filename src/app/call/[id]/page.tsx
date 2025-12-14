"use client";

import { useStreamVideoClient, StreamCall, StreamTheme, SpeakerLayout, CallControls, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CallPage() {
    const { id } = useParams<{ id: string }>();
    const client = useStreamVideoClient();
    const router = useRouter();
    const [call, setCall] = useState<any>(null);

    useEffect(() => {
        if (!client || !id) return;

        const myCall = client.call('default', id);

        // auto-join
        myCall.join({ create: true }).then(() => {
            setCall(myCall);
        }).catch((err) => {
            console.error("Failed to join call", err);
            // Optionally handle error (e.g. call doesn't exist)
        });

        return () => {
            // Leave call on unmount (tab close)
            myCall.leave();
        };
    }, [client, id]);

    if (!client || !call) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p>Connecting to secure line...</p>
                </div>
            </div>
        );
    }

    return (
        <StreamCall call={call}>
            <div className="flex h-screen w-full flex-col bg-zinc-950">
                <StreamTheme>
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
                        <SpeakerLayout participantsBarPosition="bottom" />
                    </div>
                    <div className="bg-zinc-900 border-t border-zinc-800 p-6 flex items-center justify-center shadow-2xl safe-area-pb">
                        <CallControls
                            onLeave={() => {
                                // Close the tab on hangup
                                window.close();
                                // Fallback if script didn't open tab
                                router.push('/chat');
                            }}
                        />
                    </div>
                </StreamTheme>
            </div>
        </StreamCall>
    );
}
