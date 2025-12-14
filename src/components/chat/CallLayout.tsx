'use client';

import { useCalls, StreamCall } from '@stream-io/video-react-sdk';
import CallInterface from './CallInterface';

export default function CallLayout() {
    // Listen for calls (incoming or active)
    const calls = useCalls();
    // For 1:1 calling, we usually just care about the first one. 
    // If there are multiple, we might picking the one that is ringing or joined.
    const call = calls[0];

    if (!call) return null;

    return (
        <StreamCall call={call}>
            <CallInterface />
        </StreamCall>
    );
}
