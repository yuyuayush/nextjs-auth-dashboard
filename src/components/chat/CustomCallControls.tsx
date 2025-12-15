// @ts-nocheck
"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, Users, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { searchUsers } from "@/app/actions/chat"; // We'll need to make sure this exists or use explored users

export default function CustomCallControls() {
    const call = useCall();
    const { useMicrophoneState, useCameraState, useScreenShareState } = useCallStateHooks();
    const { isEnabled: isMicEnabled, microphone } = useMicrophoneState();
    const { isEnabled: isCamEnabled, camera } = useCameraState();
    const { isEnabled: isScreenShareEnabled, screenShare } = useScreenShareState();

    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    if (!call) return null;

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length > 2) {
            // Need a server action to search users. For now, we can use a placeholder or implement it.
            // Let's assume we have a simple user search function or list.
            try {
                const users = await searchUsers(query);
                setSearchResults(users);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const inviteUser = async (userId: string) => {
        try {
            await call.addMembers({ members: [{ user_id: userId }] });
            toast.success("Invited user to call");
            setIsInviteOpen(false);
        } catch (error) {
            console.error("Invite failed", error);
            toast.error("Failed to invite user");
        }
    };

    return (
        <div className="flex items-center justify-center gap-3 md:gap-4 p-1 md:p-0">
            {/* Microphone */}
            <button
                onClick={() => microphone.toggle()}
                className={`p-3 md:p-4 rounded-full transition-all duration-200 ${isMicEnabled ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'}`}
            >
                {isMicEnabled ? <Mic className="w-5 h-5 md:w-6 md:h-6" /> : <MicOff className="w-5 h-5 md:w-6 md:h-6" />}
            </button>

            {/* Camera */}
            <button
                onClick={() => camera.toggle()}
                className={`p-3 md:p-4 rounded-full transition-all duration-200 ${isCamEnabled ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'}`}
            >
                {isCamEnabled ? <Video className="w-5 h-5 md:w-6 md:h-6" /> : <VideoOff className="w-5 h-5 md:w-6 md:h-6" />}
            </button>

            {/* Screen Share */}
            <button
                onClick={async () => {
                    try {
                        await screenShare.toggle();
                    } catch (error) {
                        console.error("Screen share failed", error);
                        toast.error("Failed to share screen. Check permissions.");
                    }
                }}
                disabled={!screenShare.isSupported}
                className={`p-3 md:p-4 rounded-full transition-all duration-200 ${isScreenShareEnabled ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
                title="Share Screen"
            >
                <ScreenShare className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Add Participant */}
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                    <button className="p-3 md:p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-200">
                        <Users className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Add to Call</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {searchResults.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-2 rounded hover:bg-zinc-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                                                    {user.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <span>{user.name}</span>
                                    </div>
                                    <Button size="sm" onClick={() => inviteUser(user.id)} className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="w-4 h-4 mr-1" /> Add
                                    </Button>
                                </div>
                            ))}
                            {searchQuery.length > 2 && searchResults.length === 0 && (
                                <p className="text-center text-zinc-500 py-4">No users found</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* End Call */}
            <button
                onClick={() => call.leave()}
                className="p-3 md:p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 scale-110 shadow-xl shadow-red-600/30"
            >
                <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
            </button>
        </div>
    );
}
