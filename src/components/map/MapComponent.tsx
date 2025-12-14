"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import { getFriendsLocations, updateUserLocation } from "@/app/actions/location";
import AvatarSelector from "./AvatarSelector";

// Fix for default Leaflet markers in Next.js/Webpack
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Friend {
    id: string;
    name: string;
    image: string | null;
    latitude: number;
    longitude: number;
}

// Controller to handle automatic recentering
function RecenterController({ position }: { position: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 13);
        }
    }, [position, map]);
    return null;
}

// Global Controller for Buttons inside Map Context
function MapControllers({ onUpdateLocation, onRecenter }: { onUpdateLocation: () => void, onRecenter: () => void }) {
    return (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button
                onClick={onUpdateLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm shadow-md"
            >
                📍 Update & Center
            </button>
            <button
                onClick={onRecenter}
                className="px-4 py-2 bg-white text-gray-800 rounded hover:bg-gray-100 font-semibold text-sm shadow-md"
            >
                🎯 Recenter
            </button>
        </div>
    );
}

export default function MapComponent() {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);

    const handleUpdateLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);

                updateUserLocation(latitude, longitude)
                    .then(() => {
                        console.log("Location updated");
                        getFriendsLocations().then(setFriends).catch(console.error);
                    })
                    .catch((err) => console.error("Failed to save location", err));
            },
            (err) => {
                console.error(err);
                alert("Unable to retrieve your location");
                // For debug: set a dummy location if local fails
                // setPosition([51.505, -0.09]);
            }
        );
    };

    useEffect(() => {
        getFriendsLocations().then(setFriends).catch(console.error);
        // Try getting location on mount
        handleUpdateLocation();
    }, []);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d.toFixed(1);
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    const getInitials = (name: string) => {
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const getRandomColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00ffffff).toString(16).toUpperCase();
        return "#" + "00000".substring(0, 6 - c.length) + c;
    };

    const getMarkerIcon = (friend: Friend | null, isUser: boolean = false) => {
        const imageUrl = isUser ? currentAvatar : friend?.image;
        const name = isUser ? "Me" : friend?.name || "User";

        if (imageUrl) {
            return L.icon({
                iconUrl: imageUrl,
                iconSize: [40, 40],
                className: "rounded-full border-2 border-white shadow-lg object-cover bg-white"
            });
        }

        const bgColor = getRandomColor(name);

        return L.divIcon({
            className: "bg-transparent",
            html: `<div style="background-color: ${bgColor}; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); color: white; font-weight: bold; font-size: 14px;">${getInitials(name)}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
    };

    // Inner component to access map instance for buttons
    function MapButtons() {
        const map = useMap();
        return (
            <MapControllers
                onUpdateLocation={handleUpdateLocation}
                onRecenter={() => {
                    if (position) map.flyTo(position, 13);
                    else handleUpdateLocation();
                }}
            />
        );
    }

    return (
        <div className="relative h-[80vh] w-full rounded-lg overflow-hidden border">
            <AvatarSelector
                currentAvatar={currentAvatar}
                onAvatarUpdate={(url) => {
                    setCurrentAvatar(url);
                }}
            />

            <MapContainer
                center={position || [51.505, -0.09]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterController position={position} />
                <MapButtons />

                {position && (
                    <Marker position={position} icon={getMarkerIcon(null, true)}>
                        <Popup>
                            You are here.
                        </Popup>
                    </Marker>
                )}

                {friends.map((friend) => (
                    <Marker
                        key={friend.id}
                        position={[friend.latitude, friend.longitude]}
                        icon={getMarkerIcon(friend)}
                    >
                        <Popup>
                            <div className="flex flex-col items-center">
                                {friend.image ? (
                                    <img src={friend.image} alt={friend.name} className="w-10 h-10 rounded-full mb-2 object-cover" />
                                ) : (
                                    <div
                                        className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold mb-2"
                                        style={{ backgroundColor: getRandomColor(friend.name) }}
                                    >
                                        {getInitials(friend.name)}
                                    </div>
                                )}
                                <span className="font-bold">{friend.name}</span>
                                <span className="text-xs text-gray-500">
                                    {calculateDistance(position ? position[0] : 0, position ? position[1] : 0, friend.latitude, friend.longitude)} km away
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
