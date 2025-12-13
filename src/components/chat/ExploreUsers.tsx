'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sendFriendRequest } from '@/app/actions/friends';
import { toast } from 'sonner';
import { UserPlus, Clock, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserWithStatus {
    id: string;
    name: string;
    image?: string | null;
    friendStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
}

export default function ExploreUsers({ users }: { users: UserWithStatus[] }) {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const router = useRouter();

    const handleSendRequest = async (userId: string) => {
        setLoadingMap(prev => ({ ...prev, [userId]: true }));
        try {
            await sendFriendRequest(userId);
            toast.success("Friend request sent!");
            router.refresh();
        } catch (error) {
            toast.error("Failed to send request");
        } finally {
            setLoadingMap(prev => ({ ...prev, [userId]: false }));
        }
    };

    const stragers = users.filter(u => u.friendStatus === 'none' || u.friendStatus === 'pending_sent');

    if (stragers.length === 0) {
        return <div className="p-8 text-center text-gray-500">No new users to explore.</div>
    }

    return (
        <div className="grid grid-cols-1 gap-4 p-4">
            {stragers.map(user => (
                <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">User</p>
                        </div>
                    </div>

                    {user.friendStatus === 'none' && (
                        <Button
                            size="sm"
                            onClick={() => handleSendRequest(user.id)}
                            disabled={loadingMap[user.id]}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add
                        </Button>
                    )}

                    {user.friendStatus === 'pending_sent' && (
                        <Button size="sm" variant="secondary" disabled className="text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            Sent
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
}
