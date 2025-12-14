'use client';

import {
    useCall,
    useCallStateHooks,
    ParticipantView,
    CallControls,
    SpeakerLayout,
    StreamTheme
} from '@stream-io/video-react-sdk';
import { X, Phone, User as UserIcon } from 'lucide-react';
import Image from 'next/image';

export default function CallInterface() {
    const call = useCall();
    const { useCallCallingState, useParticipantCount, useCallCreatedBy } = useCallStateHooks();
    const callingState = useCallCallingState();
    const participantCount = useParticipantCount();
    const creator = useCallCreatedBy();

    if (!call) return null;

    // Determines if we are the one calling (Outgoing) vs receiving (Incoming)
    const isCreator = call.state.createdBy?.id === call.currentUserId;
    // Get other participants for display
    const otherParticipants = call.state.members.filter(m => m.user_id !== call.currentUserId);
    const targetUser = otherParticipants[0]?.user; // For 1:1 calls

    // Incoming Call State (Ring) - Only if we are NOT the creator
    if (callingState === 'ringing' && !isCreator) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md">
                <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">

                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                        {creator?.image ? (
                            <Image src={creator.image} alt={creator.name || 'Caller'} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                <UserIcon className="w-16 h-16 text-zinc-500" />
                            </div>
                        )}
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-white tracking-tight">{creator?.name || 'Unknown Caller'}</h2>
                        <p className="text-zinc-400 text-lg font-medium flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Incoming Video Call...
                        </p>
                    </div>

                    <div className="flex gap-12 mt-4">
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => call.leave({ reject: true })}
                                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-red-500/20"
                            >
                                <X className="w-8 h-8 text-white" />
                            </button>
                            <span className="text-xs text-white/50 font-medium">Decline</span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => {
                                    // Open call in new tab
                                    window.open(`/call/${call.id}`, '_blank');
                                    // We don't join here, the new tab will join.
                                    // Eventually the 'ringing' state will stop as the call becomes active elsewhere.
                                }}
                                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-green-500/20 animate-bounce"
                            >
                                <Phone className="w-8 h-8 text-white" />
                            </button>
                            <span className="text-xs text-white/50 font-medium">Accept</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // New Tab Logic: We DO NOT render outgoing or active calls in the main app anymore.
    // They are handled in the popup window.
    return null;
}
