"use client";

import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { updateUserName, updateUserAvatar, updateUserDetails } from "@/app/actions/user";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

export default function ProfilePage() {
    const { data: session, refetch } = useSession();
    const [name, setName] = useState("");
    const [birthday, setBirthday] = useState<Date | undefined>(undefined);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (session?.user) {
                setName(session.user.name || "");
                // Fetch full user details from DB
                const { getUser } = await import("@/app/actions/user");
                const user = await getUser();
                if (user) {
                    if (user.birthday) setBirthday(new Date(user.birthday));
                    if (user.address) setAddress(user.address);
                }
            }
        };
        fetchUserData();
    }, [session]);

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            await updateUserDetails({ name, birthday, address });
            toast.success("Profile updated successfully");
            refetch();
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAvatar = async (url: string) => {
        setAvatarLoading(true);
        try {
            await updateUserAvatar(url);
            toast.success("Avatar updated successfully");
            refetch();
        } catch (error) {
            toast.error("Failed to update avatar");
        } finally {
            setAvatarLoading(false);
        }
    };

    if (!session) {
        return <div className="flex justify-center p-8">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={session.user.email} disabled className="bg-gray-100" />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="birthday">Birthday</Label>
                        <Input
                            id="birthday"
                            type="date"
                            value={birthday ? new Date(birthday).toISOString().split('T')[0] : ''}
                            onChange={(e) => setBirthday(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your address"
                        />
                    </div>

                    <Button onClick={handleUpdateProfile} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Avatar</h2>
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Current Avatar</p>
                    <div className="flex items-center gap-4">
                        {session.user.image ? (
                            <img src={session.user.image} alt="Current" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                                {session.user.name?.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {AVAILABLE_AVATARS.map((avatar, index) => (
                        <button
                            key={index}
                            onClick={() => handleUpdateAvatar(avatar)}
                            disabled={avatarLoading}
                            className={`relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${session.user.image === avatar ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}
                        >
                            <img src={avatar} alt={`Avatar option ${index + 1}`} className="w-full aspect-square object-cover" />
                            {session.user.image === avatar && (
                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                    <div className="bg-white rounded-full p-1 text-blue-500">
                                        ✓
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
