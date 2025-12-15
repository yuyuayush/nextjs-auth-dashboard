"use client";

import { useStreamVideoClient, StreamCall, StreamTheme, SpeakerLayout, useCallStateHooks, ParticipantView, useCall } from '@stream-io/video-react-sdk';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CustomCallControls from '@/components/chat/CustomCallControls';

export default function CallPage() {
    const { id } = useParams<{ id: string }>();
    const client = useStreamVideoClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isVideo = searchParams.get('video') === 'true';
    const [call, setCall] = useState<any>(null);

    useEffect(() => {
        if (!client || !id) return;

        const myCall = client.call('default', id);

        // auto-join
        myCall.join({ create: true }).then(async () => {
            setCall(myCall);
            // Handle initial media state based on call type
            if (!isVideo) {
                await myCall.camera.disable();
                // Ensure mic is on by default for audio calls
                await myCall.microphone.enable();
            } else {
                await myCall.camera.enable();
                await myCall.microphone.enable();
            }
        }).catch((err) => {
            console.error("Failed to join call", err);
        });

        return () => {
            // Leave call on unmount (tab close)
            myCall.leave();
        };
    }, [client, id, isVideo]);

    if (!client || !call) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-zinc-400 animate-pulse">Establishing secure connection...</p>
                </div>
            </div>
        );
    }

    return (
        <StreamCall call={call}>
            <ActiveCallUI />
        </StreamCall>
    );
}

function ActiveCallUI() {
    const call = useStreamVideoClient()!.call('default', useParams<{ id: string }>().id!); // Re-grab call or pass as prop (context is better)
    // Actually, useCall() hook is safer inside StreamCall
    return <ActiveCallContent />;
}

// Separate component to safely use hooks inside StreamCall context
function ActiveCallContent() {
    const { useParticipantCount, useParticipants, useLocalParticipant } = useCallStateHooks();
    const call = useCall();
    const participantCount = useParticipantCount();
    const participants = useParticipants();
    const localParticipant = useLocalParticipant();

    // Derived state for layout
    const isOneOnOne = participantCount <= 2;

    // Find screen share participant
    // @ts-ignore
    const screenShareParticipant = participants.find(p => p.publishedTracks.includes('screenShare'));

    // For 1:1, get the "other" person
    const remoteParticipant = participants.find(p => p.userId !== localParticipant?.userId);

    return (
        <div className="flex h-screen w-full flex-col bg-zinc-950 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />

            <StreamTheme className="flex-1 flex flex-col h-full">
                <div className="flex-1 relative flex items-center justify-center p-0 md:p-4 lg:p-8 w-full h-full">
                    <div className="w-full h-full md:max-w-6xl md:h-[90vh] mx-auto md:rounded-3xl overflow-hidden shadow-2xl border-0 md:border border-white/5 bg-black/40 backdrop-blur-sm relative flex flex-col">

                        {/* PRIORITY 1: Screen Share (Always takes over if active) */}
                        {screenShareParticipant ? (
                            <ParticipantView
                                participant={screenShareParticipant}
                                trackType="screenShareTrack"
                                className="w-full h-full object-contain bg-black"
                            />
                        ) : isOneOnOne ? (
                            /* PRIORITY 2: 1:1 Layout (WhatsApp Style) */
                            <div className="relative w-full h-full">
                                {/* Fullscreen Remote Participant */}
                                {remoteParticipant ? (
                                    <ParticipantView
                                        participant={remoteParticipant}
                                        trackType="videoTrack"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 animate-pulse">
                                        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                        </div>
                                        <p>Waiting for others to join...</p>
                                    </div>
                                )}

                                {/* Draggable/Floating Local Participant (PiP) */}
                                <div className="absolute top-4 right-4 w-32 h-48 md:w-48 md:h-64 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 z-10 transition-all hover:scale-105">
                                    {localParticipant && (
                                        <ParticipantView
                                            participant={localParticipant}
                                            trackType="videoTrack"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* PRIORITY 3: Group Layout (Google Meet Grid Style) */
                            <SpeakerLayout participantsBarPosition="bottom" />
                        )}
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-full px-4 py-3 md:px-8 md:py-2 shadow-xl pointer-events-auto mx-4 max-w-full overflow-x-auto no-scrollbar">
                        <CustomCallControls />
                    </div>
                </div>
            </StreamTheme>
        </div>
    );
}
