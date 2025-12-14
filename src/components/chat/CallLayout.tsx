'use client';

import { usePathname } from 'next/navigation';
import { useCalls, StreamCall } from '@stream-io/video-react-sdk';
import CallInterface from './CallInterface';

export default function CallLayout() {
    const pathname = usePathname();
    // Listen for calls (incoming or active)
    const calls = useCalls();
    // For 1:1 calling, we usually just care about the first one. 
    // If there are multiple, we might picking the one that is ringing or joined.
    const call = calls[0];

    // Don't render global overlay if we are already on the dedicated call page
    if (pathname.startsWith('/call/')) return null;

    if (!call) return null;

    return (
        <StreamCall call={call}>
            <CallInterface />
        </StreamCall>
    );
}
