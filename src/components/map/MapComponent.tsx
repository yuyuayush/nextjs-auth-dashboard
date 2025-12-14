"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import { getFriendsLocations, updateUserLocation, getMyLocation } from "@/app/actions/location";
import AvatarSelector from "./AvatarSelector";
import { useSession } from "@/lib/auth-client";
import { getDebugFriendLocationData } from "@/app/actions/debug-map";

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

// Helper functions
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

// --- Sub-components ---

// 1. Recenter Map Logic
function RecenterController({ position }: { position: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 13);
        }
    }, [position, map]);
    return null;
}

// 2. Initial Map Setup & Instance Hoisting
function MapInstanceSetter({ setMap }: { setMap: (map: L.Map) => void }) {
    const map = useMap();
    useEffect(() => {
        setMap(map);
    }, [map, setMap]);
    return null;
}

// 3. Map Control Buttons (Update, Recenter, Debug)
function MapControllers({ onUpdateLocation, onRecenter, onDebug, showDebugButton }: { onUpdateLocation: () => void, onRecenter: () => void, onDebug: () => void, showDebugButton: boolean }) {
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
            {showDebugButton && (
                <button
                    onClick={onDebug}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 font-semibold text-sm shadow-md"
                >
                    🐞 Debug
                </button>
            )}
        </div>
    );
}

// 4. Friend List Panel (Now accepts `map` instance)
function FriendListPanel({ friends, map }: { friends: Friend[], map: L.Map | null }) {
    const [isOpen, setIsOpen] = useState(false);

    if (friends.length === 0) return null;

    return (
        <div className="
            /* Mobile Positioning: Relative block below map */
            w-full relative mt-[-1px] z-10
            
            /* Desktop Positioning: Absolute overlay */
            md:absolute md:top-36 md:left-4 md:z-[1000] md:max-w-[250px] md:mt-0 md:w-auto
        ">
            {/* Toggle Button (Mobile Only) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden w-full bg-white p-3 border-t border-b md:border border-gray-200 flex items-center justify-between transition-all hover:bg-gray-50 mb-2 md:rounded-lg md:shadow-md"
            >
                <span className="font-bold text-sm text-gray-700">Friends Nearby ({friends.length})</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* List Content */}
            <div className={`
                bg-white border-b md:border border-gray-200 
                overflow-y-auto transition-all duration-300
                /* Smooth expand on mobile */
                ${isOpen ? 'max-h-[300px]' : 'max-h-0 md:max-h-[400px]'}
                
                /* Always visible sidebar style on Desktop */
                md:block md:rounded-lg md:shadow-md md:p-2 md:bg-white/90 md:backdrop-blur-sm
            `}>
                <h3 className="hidden md:block font-bold text-sm mb-2 text-gray-700 px-1">Friends Nearby ({friends.length})</h3>
                <div className="flex flex-col gap-2 p-2 md:p-0">
                    {friends.map((friend) => (
                        <button
                            key={friend.id}
                            onClick={() => {
                                if (map) {
                                    map.flyTo([friend.latitude, friend.longitude], 15);
                                    // Scroll map into view on mobile if needed?
                                    // document.getElementById('map-container')?.scrollIntoView({ behavior: 'smooth' });
                                }
                                setIsOpen(false); // Close on selection (mobile mainly)
                            }}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors text-left w-full border border-transparent hover:border-blue-100"
                        >
                            {friend.image ? (
                                <img src={friend.image} alt={friend.name} className="w-10 h-10 rounded-full object-cover border border-gray-300 shrink-0 bg-gray-100" />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
                                    style={{ backgroundColor: getRandomColor(friend.name) }}
                                >
                                    {getInitials(friend.name)}
                                </div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-gray-800 truncate">{friend.name}</span>
                                <span className="text-xs text-blue-600 font-medium">Click to view location</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 5. Main Buttons Wrapper (Inside Map)
function MapButtonsWrapper({
    onUpdateLocation,
    handleUpdateLocation,
    onDebug,
    position
}: {
    onUpdateLocation: () => void,
    handleUpdateLocation: () => void,
    onDebug: () => void,
    position: [number, number] | null
}) {
    const map = useMap(); // Used for 'Recenter' logic fallback if needed
    const { data: session } = useSession();
    const showDebugButton = session?.user?.email === "ayushnegi1912@gmail.com";

    return (
        <MapControllers
            onUpdateLocation={onUpdateLocation}
            onRecenter={() => {
                if (position) map.flyTo(position, 13);
                else handleUpdateLocation();
            }}
            onDebug={onDebug}
            showDebugButton={showDebugButton}
        />
    );
}

// --- Main Component ---

export default function MapComponent() {
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
    const [debugData, setDebugData] = useState<any>(null);
    const [showDebug, setShowDebug] = useState(false);

    // ... (Existing Logic for Fetching Data)
    const handleDebug = async () => {
        const data = await getDebugFriendLocationData();
        setDebugData(data);
        setShowDebug(true);
    };

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
                        // Fetch again to be safe
                        getFriendsLocations().then(setFriends).catch(console.error);
                    })
                    .catch((err) => console.error("Failed to save location", err));
            },
            (err) => {
                console.error(err);
                alert("Unable to retrieve your location");
            }
        );
    };

    useEffect(() => {
        getMyLocation().then((loc) => {
            if (loc) {
                setPosition([loc.latitude, loc.longitude]);
                if (loc.image) setCurrentAvatar(loc.image);
            }
        });

        const fetchFriends = () => {
            getFriendsLocations()
                .then((data) => setFriends(data))
                .catch(console.error);
        };
        fetchFriends();
        handleUpdateLocation();
        const intervalId = setInterval(fetchFriends, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        // ... (Same Logic)
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    const getMarkerIcon = (friend: Friend | null, isUser: boolean = false) => {
        // ... (Same Logic)
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

    return (
        // Main Container changes: flex-col for mobile stacking
        <div id="map-container" className="flex flex-col md:block relative w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50">

            <AvatarSelector
                currentAvatar={currentAvatar}
                onAvatarUpdate={(url) => setCurrentAvatar(url)}
            />

            {/* Map Wrapper: Fixed height on mobile, full height of container on Desktop */}
            <div className="h-[60vh] md:h-[80vh] w-full relative z-0">
                <MapContainer
                    center={position || [51.505, -0.09]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Helper to capture map instance */}
                    <MapInstanceSetter setMap={setMapInstance} />
                    <RecenterController position={position} />

                    <MapButtonsWrapper
                        onUpdateLocation={handleUpdateLocation}
                        handleUpdateLocation={handleUpdateLocation}
                        onDebug={handleDebug}
                        position={position}
                    />

                    {/* Markers */}
                    {position && (
                        <Marker position={position} icon={getMarkerIcon(null, true)}>
                            <Popup>You are here.</Popup>
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

            {/* Friend List Panel: Rendered OUTSIDE MapContainer for mobile flow, but uses `mapInstance` for control */}
            <FriendListPanel friends={friends} map={mapInstance} />

            {/* Debug Modal */}
            {showDebug && (
                <div className="absolute inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Debug Info</h3>
                            <button onClick={() => setShowDebug(false)} className="text-red-500 font-bold">Close</button>
                        </div>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(debugData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
