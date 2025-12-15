"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getMapSession, addMarker } from "@/app/actions/map";
import { toast } from "sonner";
import { Loader2, Share2, MapPin } from "lucide-react";
import { Button } from "../ui/button";

// Fix for default Leaflet markers
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function SharedMap({ sessionId }: { sessionId: string }) {
    const [markers, setMarkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSession = async () => {
        try {
            const data = await getMapSession(sessionId);
            if (data) {
                setMarkers(data.markers);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
        const interval = setInterval(fetchSession, 2000); // 2s polling
        return () => clearInterval(interval);
    }, [sessionId]);

    const handleAddMarker = async (lat: number, lng: number) => {
        const promise = addMarker(sessionId, lat, lng, "pin", "New Marker");
        toast.promise(promise, {
            loading: "Adding marker...",
            success: "Marker added!",
            error: "Failed to add marker"
        });
        await promise;
        fetchSession();
    };

    const copyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success("Map link copied to clipboard!");
    };

    if (loading && markers.length === 0) {
        return <div className="flex h-96 items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>;
    }

    return (
        <div className="relative w-full h-[80vh] rounded-xl overflow-hidden shadow-2xl border-4 border-slate-900/10">
            <div className="absolute top-4 right-4 z-[999] flex gap-2">
                <Button onClick={copyLink} className="bg-white/90 text-slate-800 hover:bg-white backdrop-blur shadow-lg font-bold">
                    <Share2 className="w-4 h-4 mr-2" /> Share Map
                </Button>
            </div>

            <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }} className="z-0">
                {/* Dark Mode Tiles (CartoDB Dark Matter) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapEvents onMapClick={handleAddMarker} />

                {markers.map((marker) => (
                    <Marker key={marker.id} position={[marker.latitude, marker.longitude]}>
                        <Popup>
                            <div className="text-sm font-bold">{marker.label}</div>
                            <div className="text-xs text-gray-500">Lat: {marker.latitude.toFixed(4)}, Lng: {marker.longitude.toFixed(4)}</div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
