"use client";

import { useState } from "react";
import { updateUserAvatar } from "@/app/actions/user";

const AVAILABLE_AVATARS = [
    "/avatars/cool_avatar_1.png",
    "/avatars/cool_avatar_2.png",
    "/avatars/cool_avatar_3.png",
    "/avatars/cool_avatar_4.png",
    "/avatars/cool_avatar_5.png",
    "/avatars/cool_avatar_6.png",
    "/avatars/cool_avatar_7.png",
    "/avatars/cool_avatar_8.png",
];

// Assuming original files were named with timestamp, I will need to rename them or list them dynamically. 
// For now, I will rename them in the next step to match these simple names.

export default function AvatarSelector({ currentAvatar, onAvatarUpdate }: { currentAvatar?: string | null, onAvatarUpdate: (url: string) => void }) {
    const [selected, setSelected] = useState(currentAvatar);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = async (avatarUrl: string) => {
        setSelected(avatarUrl);
        await updateUserAvatar(avatarUrl);
        onAvatarUpdate(avatarUrl);
        setIsOpen(false);
    };

    return (
        <div className="absolute top-20 left-4 z-[2000]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white p-2 rounded shadow-md font-semibold text-sm hover:bg-gray-100"
            >
                {isOpen ? "Close Avatars" : "🎨 Change Avatar"}
            </button>

            {isOpen && (
                <div className="mt-2 bg-white p-4 rounded shadow-lg grid grid-cols-2 gap-4 w-64">
                    {AVAILABLE_AVATARS.map((avatar, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelect(avatar)}
                            className={`p-1 rounded border-2 ${selected === avatar ? "border-blue-500" : "border-transparent"} hover:border-gray-300`}
                        >
                            <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full rounded object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
