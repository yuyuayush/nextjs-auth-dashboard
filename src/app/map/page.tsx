"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
    ssr: false,
    loading: () => <p>Loading map...</p>,
});

export default function MapPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Friends Map</h1>
            <MapComponent />
        </div>
    );
}
