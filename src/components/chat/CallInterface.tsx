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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
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
                                onClick={() => call.join()}
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

    // Outgoing Call State (Calling...) - When we are joined but alone
    // or explicit 'ringing' if we are the creator
    if ((callingState === 'ringing' && isCreator) || (callingState === 'joined' && participantCount <= 1)) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
                <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                        {targetUser?.image ? (
                            <Image src={targetUser.image} alt={targetUser.name || 'User'} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                <UserIcon className="w-16 h-16 text-zinc-500" />
                            </div>
                        )}
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-white tracking-tight">{targetUser?.name || 'User'}</h2>
                        <p className="text-zinc-400 text-lg font-medium flex items-center justify-center gap-2">
                            Calling...
                        </p>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={() => call.leave()}
                            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-red-500/20"
                        >
                            <Phone className="w-8 h-8 text-white rotate-[135deg]" />
                        </button>
                        <p className="text-center text-xs text-white/50 mt-2 font-medium">End</p>
                    </div>
                </div>
            </div>
        );
    }

    // Active Call State
    if (callingState === 'joining' || callingState === 'joined') {
        return (
            <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col animate-in slide-in-from-bottom duration-300">
                <StreamTheme>
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
                        <SpeakerLayout participantsBarPosition="bottom" />
                    </div>

                    <div className="bg-zinc-900 border-t border-zinc-800 p-6 flex items-center justify-center shadow-2xl">
                        <CallControls onLeave={() => call.leave()} />
                    </div>
                </StreamTheme>
            </div>
        );
    }

    return null;
}
