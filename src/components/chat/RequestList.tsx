'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { acceptFriendRequest, rejectFriendRequest } from '@/app/actions/friends';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserWithStatus {
    id: string;
    name: string;
    image?: string | null;
    friendStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
    requestId?: string;
}

export default function RequestList({ users }: { users: UserWithStatus[] }) {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const router = useRouter();

    const requests = users.filter(u => u.friendStatus === 'pending_received');

    const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
        setLoadingMap(prev => ({ ...prev, [requestId]: true }));
        try {
            if (action === 'accept') {
                await acceptFriendRequest(requestId);
                toast.success("Friend request accepted!");
            } else {
                await rejectFriendRequest(requestId);
                toast.success("Friend request rejected");
            }
            router.refresh();
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setLoadingMap(prev => ({ ...prev, [requestId]: false }));
        }
    };

    if (requests.length === 0) {
        return <div className="p-8 text-center text-gray-500">No pending requests.</div>
    }

    return (
        <div className="space-y-3 p-4">
            {requests.map(user => (
                <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">Sent you a request</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => user.requestId && handleAction(user.requestId, 'reject')}
                            disabled={loadingMap[user.requestId!]}
                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-100"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => user.requestId && handleAction(user.requestId, 'accept')}
                            disabled={loadingMap[user.requestId!]}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
