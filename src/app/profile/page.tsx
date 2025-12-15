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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const { uploadAvatar } = await import("@/app/actions/user");
            const res = await uploadAvatar(formData);

            if (res.success && res.url) {
                await handleUpdateAvatar(res.url); // Use the URL to update the user profile
            } else {
                toast.error(res.error || "Failed to upload image");
            }

        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setAvatarLoading(false);
        }
    };

    if (!session) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
            {/* Header / Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 h-48 md:h-64 shadow-2xl flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight z-10 drop-shadow-md">
                    {session.user.name}&apos;s Profile
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-20 relative z-20 px-4 md:px-0">

                {/* Avatar Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center h-full border border-gray-100">
                        <div className="relative mb-4 group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-white shadow-lg overflow-hidden">
                                {session.user.image ? (
                                    <img src={session.user.image} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold">
                                        {session.user.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110">
                                {avatarLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                )}
                                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={avatarLoading} />
                            </label>
                        </div>

                        <h2 className="text-xl font-bold text-gray-800">{session.user.name}</h2>
                        <p className="text-gray-500 text-sm mb-6">{session.user.email}</p>

                        <div className="w-full border-t pt-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Choose Avatar Preset</p>
                            <div className="grid grid-cols-4 gap-2">
                                {AVAILABLE_AVATARS.map((avatar, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleUpdateAvatar(avatar)}
                                        disabled={avatarLoading}
                                        className={`rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${session.user.image === avatar ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-blue-300'}`}
                                    >
                                        <img src={avatar} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Personal Details</h2>
                            <Button onClick={handleUpdateProfile} disabled={loading} className="bg-slate-900 hover:bg-slate-800 rounded-xl">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" value={session.user.email} disabled className="bg-gray-50 border-gray-200 text-gray-500" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="border-gray-200 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birthday">Birthday</Label>
                                <Input
                                    id="birthday"
                                    type="date"
                                    value={birthday ? new Date(birthday).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setBirthday(e.target.value ? new Date(e.target.value) : undefined)}
                                    className="border-gray-200 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="e.g. 123 Main St, New York"
                                    className="border-gray-200 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
