"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "sonner";
import { Loader2, Save, MapPin, Search, Plane, Trash2, WifiOff, Zap, Users, Navigation, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { searchPlaces, getRecommendations, getPlaceName } from "@/app/actions/tour";
import { createMapSession, joinSession, approveParticipant, updateLocation, getRoute, getMapSession } from "@/app/actions/map";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// Leaflet Icon Fix - moved to component to avoid SSR issues
const iconConfig = {
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
};

interface Place {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: string;
    rating?: number;
    image?: string | null;
    description?: string;
}

interface Participant {
    id: string;
    userId: string;
    status: string;
    latitude: number;
    longitude: number;
    name?: string;
    image?: string;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function MapController({ center, zoom }: { center: [number, number] | null, zoom: number }) {
    const map = useMapEvents({});
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
}

export default function TourMap({ user }: { user?: { name: string, image?: string } }) {
    const [planName, setPlanName] = useState("My Dream Trip");
    const [markers, setMarkers] = useState<Place[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [recommendations, setRecommendations] = useState<Place[]>([]);
    const [isOffline, setIsOffline] = useState(false);

    // Map View Control
    const [viewCenter, setViewCenter] = useState<[number, number] | null>(null);
    const [viewZoom, setViewZoom] = useState(2);

    // Mobile View Toggle (Map vs List)
    const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

    // Ride Mode & Sharing State
    const [isRideMode, setIsRideMode] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [myLocation, setMyLocation] = useState<[number, number] | null>(null);
    const [startLocationQuery, setStartLocationQuery] = useState("Detecting Location...");

    // Navigation State
    const [routeMetrics, setRouteMetrics] = useState<{ duration: number, distance: number } | null>(null);
    const [routeSteps, setRouteSteps] = useState<any[]>([]);

    // Initial Load from LocalStorage and Leaflet Fix
    useEffect(() => {
        // Fix Leaflet icons
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions(iconConfig);

        const savedPlan = localStorage.getItem("tour_plan");
        if (savedPlan) {
            try {
                const parsed = JSON.parse(savedPlan);
                setPlanName(parsed.name);
                setMarkers(parsed.markers);
            } catch (e) {
                console.error("Failed to load plan", e);
            }
        }

        const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    // Polling for Live Session
    useEffect(() => {
        if (!sessionId) return;

        const poll = async () => {
            try {
                const data = await getMapSession(sessionId);
                if (data && data.participants) {
                    setParticipants(data.participants as Participant[]);
                }
            } catch (e) {
                console.error("Poll failed", e);
            }
        };

        const timer = setInterval(poll, 3000); // 3s polling
        poll();

        return () => clearInterval(timer);
    }, [sessionId]);

    // Track My Location for Ride Mode
    useEffect(() => {
        if (isRideMode && "geolocation" in navigator) {
            const id = navigator.geolocation.watchPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setMyLocation([latitude, longitude]);

                    if (sessionId) {
                        await updateLocation(sessionId, latitude, longitude);
                    }
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(id);
        }
    }, [isRideMode, sessionId]);

    const handleStartLocationSearch = async () => {
        if (!startLocationQuery) return;
        setIsSearching(true);
        try {
            const results = await searchPlaces(startLocationQuery);
            if (results && results.length > 0) {
                const place = results[0];
                setMyLocation([place.lat, place.lng]);
                toast.success(`Start set to: ${place.name}`);
                setViewCenter([place.lat, place.lng]);
                // Clear previous route if any locally
                setRouteCoords([]);
                setRouteMetrics(null);
                setRouteSteps([]);
            } else {
                toast.error("Start location not found");
            }
        } catch {
            toast.error("Search failed");
        } finally {
            setIsSearching(false);
        }
    };

    const handleStartSession = async () => {
        try {
            const id = await createMapSession();
            setSessionId(id);
            toast.success("Session Started!", { description: "Share ID: " + id });
            setIsRideMode(true);
        } catch (e) {
            toast.error("Failed to start session");
        }
    };

    const handleJoinSession = async () => {
        const id = prompt("Enter Session ID:");
        if (!id) return;

        try {
            const res = await joinSession(id);
            setSessionId(id);
            if (res.status === 'pending') {
                toast.info("Request sent. Waiting for approval...");
            } else {
                toast.success("Joined Session!");
                setIsRideMode(true);
            }
        } catch (e) {
            toast.error("Failed to join");
        }
    };

    const handleApprove = async (pId: string) => {
        try {
            await approveParticipant(pId);
            toast.success("User Approved!");
        } catch (e) {
            toast.error("Approval failed");
        }
    };

    const calculateRoute = async () => {
        if (!myLocation || markers.length === 0) {
            toast.error("Need your location and at least one stop.");
            return;
        }
        try {
            const result = await getRoute(myLocation[0], myLocation[1], markers[0].lat, markers[0].lng);
            if (result && result.coordinates) {
                setRouteCoords(result.coordinates as [number, number][]);
                setRouteMetrics({ duration: result.duration, distance: result.distance });
                setRouteSteps(result.steps || []);

                // Zoom in CLOSE for navigation
                enterNavMode();
                toast.success("Route Calculated!");
                // Auto-switch to map view on mobile if calculating route
                setMobileView('map');
            } else {
                toast.error("No route found");
            }
        } catch (e) {
            toast.error("Routing failed");
        }
    };

    const enterNavMode = () => {
        if (myLocation) {
            setViewCenter(myLocation);
            setViewZoom(18); // Close-up "Navigation" level
        }
    };

    const savePlan = () => {
        const planData = { name: planName, markers };
        localStorage.setItem("tour_plan", JSON.stringify(planData));
        toast.success("Plan saved offline");
    };

    const handleMapClick = async (lat: number, lng: number) => {
        const placeName = await getPlaceName(lat, lng);
        const newMarker: Place = { id: crypto.randomUUID(), name: placeName, lat, lng, type: "custom" };
        setMarkers([...markers, newMarker]);
        try {
            const recs = await getRecommendations(lat, lng);
            setRecommendations(recs);
        } catch (e) { console.error("Failed to get recs", e); }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        try {
            const results = await searchPlaces(searchQuery);
            if (results && results.length > 0) {
                const place = results[0];
                setMarkers([...markers, { ...place, id: crypto.randomUUID() }]);
                toast.success(`Found: ${place.name}`);
                setViewCenter([place.lat, place.lng]);
                setViewZoom(13);
                const recs = await getRecommendations(place.lat, place.lng);
                setRecommendations(recs);
                setMobileView('map'); // Switch to map to see result
            } else {
                toast.error("No places found");
            }
        } catch (error) { toast.error("Search failed"); } finally { setIsSearching(false); }
    };

    const removeMarker = (id: string) => { setMarkers(markers.filter(m => m.id !== id)); };

    // Helper for formatting
    const formatDuration = (sec: number) => {
        if (sec < 60) return "< 1 min";
        const min = Math.round(sec / 60);
        if (min < 60) return `${min} mins`;
        const hrs = Math.floor(min / 60);
        const remainingMins = min % 60;
        return `${hrs} hr ${remainingMins} min`;
    };

    const formatDistance = (meters: number) => {
        if (meters < 1000) return `${Math.round(meters)} m`;
        return `${(meters / 1000).toFixed(1)} km`;
    };

    // Helper for direction icons
    const getDirectionIcon = (modifier: string) => {
        if (modifier?.includes("right")) return "➡️";
        if (modifier?.includes("left")) return "⬅️";
        if (modifier?.includes("straight")) return "⬆️";
        if (modifier?.includes("uturn")) return "↩️";
        return "📍"; // Default
    };

    return (
        <div className="flex flex-col lg:flex-row h-[85vh] gap-6 relative">

            {/* Mobile Toggle Tabs */}
            <div className="lg:hidden flex mb-2 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
                <button
                    onClick={() => setMobileView('map')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${mobileView === 'map' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}
                >
                    Map View
                </button>
                <button
                    onClick={() => setMobileView('list')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${mobileView === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}
                >
                    Plan & Itinerary
                </button>
            </div>

            {/* Sidebar */}
            <div className={`w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide ${mobileView === 'map' ? 'hidden lg:flex' : 'flex'}`}>
                <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md rounded-2xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                            <Input
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                className="font-bold text-xl border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
                            />
                            <div className="flex gap-2">
                                {isOffline && <WifiOff className="text-red-500 w-5 h-5" />}
                                <Button
                                    size="sm"
                                    variant={isRideMode ? "default" : "outline"}
                                    onClick={() => setIsRideMode(!isRideMode)}
                                    className={`rounded-full ${isRideMode ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                >
                                    <Zap className={`w-4 h-4 mr-1 ${isRideMode ? 'fill-current' : ''}`} />
                                    {isRideMode ? "Ride Mode" : "Ride Mode"}
                                </Button>
                            </div>
                        </CardTitle>
                        {isRideMode && (
                            <CardDescription className="text-indigo-600 font-medium text-xs">
                                Live Navigation & Sharing
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!isRideMode ? (
                            <>
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <Input
                                        placeholder="Search places..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                    />
                                    <Button type="submit" size="icon" disabled={isSearching} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                                        {isSearching ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4" />}
                                    </Button>
                                </form>
                                <Button onClick={savePlan} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-xl">
                                    <Save className="w-4 h-4 mr-2" /> Save Offline Plan
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                                    <h4 className="flex items-center text-xs font-bold text-indigo-800 uppercase tracking-wider">
                                        <Navigation className="w-3 h-3 mr-1" /> Plan your Ride
                                    </h4>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                                            <div className="flex-1 flex gap-1">
                                                <Input
                                                    value={startLocationQuery}
                                                    onChange={(e) => setStartLocationQuery(e.target.value)}
                                                    placeholder="Current Location..."
                                                    className={`h-8 text-xs ${myLocation ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200'}`}
                                                />
                                                {!myLocation && (
                                                    <Button
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-blue-600 bg-blue-500"
                                                        onClick={handleStartLocationSearch}
                                                        title="Search Start Location"
                                                    >
                                                        <Search className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="h-4 border-l-2 border-dashed border-slate-300 ml-1" />
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                                            <Input
                                                placeholder="Enter Destination..."
                                                className="h-8 text-xs bg-white border-slate-200 focus-visible:ring-indigo-500"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSearch(e);
                                                }}
                                            />
                                            <Button
                                                size="icon"
                                                className="h-8 w-8 hover:bg-indigo-700 bg-indigo-600"
                                                onClick={handleSearch}
                                            >
                                                <Search className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Button onClick={calculateRoute} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 text-xs shadow-md shadow-indigo-200 mt-2">
                                        <Zap className="w-3 h-3 mr-2" />
                                        {myLocation ? "Start Navigation" : "Set Start Point"}
                                    </Button>
                                </div>

                                {routeMetrics && (
                                    <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2">
                                        <div className="p-3 bg-blue-600 text-white rounded-xl text-center shadow-lg shadow-blue-200">
                                            <p className="text-[10px] uppercase font-bold opacity-80">Est. Time</p>
                                            <p className="text-xl font-bold">{formatDuration(routeMetrics.duration)}</p>
                                        </div>
                                        <div className="p-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-center shadow-sm">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Distance</p>
                                            <p className="text-xl font-bold">{formatDistance(routeMetrics.distance)}</p>
                                        </div>
                                    </div>
                                )}

                                {routeSteps.length > 0 && (
                                    <div className="mt-2 bg-white rounded-xl border border-slate-100 shadow-sm max-h-48 overflow-y-auto p-2 scrollbar-thin">
                                        <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2 pl-1 sticky top-0 bg-white">Directions</h5>
                                        {routeSteps.map((step, i) => (
                                            <div key={i} className="flex gap-3 items-start p-2 hover:bg-slate-50 rounded-lg text-xs border-b border-slate-50 last:border-0">
                                                <span className="text-lg leading-none">{getDirectionIcon(step.maneuver?.modifier)}</span>
                                                <div>
                                                    <p className="font-medium text-slate-800">{step.maneuver?.type === 'arrive' ? 'Arrive at Destination' : step.name || "Continue"}</p>
                                                    <p className="text-slate-400">{Math.round(step.distance)}m</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    {!sessionId ? (
                                        <>
                                            <Button onClick={handleStartSession} variant="outline" className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                                Go Live
                                            </Button>
                                            <Button onClick={handleJoinSession} variant="ghost" className="rounded-xl text-slate-600">
                                                Join ID
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="col-span-2 p-3 bg-green-50 rounded-xl border border-green-100 text-center animate-in fade-in">
                                            <p className="text-[10px] text-green-600 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> Live Session Active
                                            </p>
                                            <div className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => {
                                                navigator.clipboard.writeText(sessionId);
                                                toast.success("Copied ID!");
                                            }}>
                                                <code className="text-sm font-bold text-green-800 tracking-wide">{sessionId.slice(0, 8)}...</code>
                                                <Users className="w-3 h-3 text-green-600" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {participants.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Riders</h4>
                                        {participants.map(p => (
                                            <div key={p.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={p.image} />
                                                        <AvatarFallback>{p.name?.[0] || 'U'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{p.name || 'User'}</p>
                                                        <p className={`text-[10px] ${p.status === 'approved' ? 'text-green-500' : 'text-orange-500'} font-medium uppercase`}>
                                                            {p.status}
                                                        </p>
                                                    </div>
                                                </div>
                                                {p.status === 'pending' && (
                                                    <Button size="sm" onClick={() => handleApprove(p.id)} className="h-7 text-xs bg-green-500 hover:bg-green-600 text-white">
                                                        Approve
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Itinerary List */}
                <div className="space-y-3">
                    {!isRideMode && markers.length > 0 && (
                        <h3 className="font-semibold text-slate-500 uppercase text-xs tracking-wider pl-1">Your Itinerary</h3>
                    )}
                    {!isRideMode && markers.length === 0 && (
                        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <Plane className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>Map is empty.</p>
                        </div>
                    )}
                    {markers.map((marker, i) => (
                        <div key={marker.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className={`font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ${isRideMode ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {i + 1}
                                </span>
                                <div>
                                    <p className="font-medium text-slate-800 leading-tight">{marker.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mt-0.5">{marker.type}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${marker.lat},${marker.lng}`, '_blank')}
                                    className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <MapPin className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeMarker(marker.id)}
                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recommendations */}
                {!isRideMode && recommendations.length > 0 && (
                    <div className="space-y-3 mt-4 animate-in slide-in-from-bottom-4">
                        <h3 className="font-semibold text-slate-500 uppercase text-xs tracking-wider pl-1">Famous Nearby</h3>
                        {recommendations.map((rec) => (
                            <div key={rec.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all"
                                onClick={() => {
                                    setMarkers([...markers, { ...rec, id: crypto.randomUUID() }]);
                                    toast.success("Added to plan!");
                                    setViewCenter([rec.lat, rec.lng]);
                                    setViewZoom(15);
                                    setMobileView('map');
                                }}>
                                {rec.image && (
                                    <div className="relative h-32 w-full overflow-hidden">
                                        <img src={rec.image} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-2 left-2 text-white p-1">
                                            <p className="font-bold text-sm shadow-black drop-shadow-md">{rec.name}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="p-3">
                                    {!rec.image && <p className="font-bold text-slate-900 mb-1">{rec.name}</p>}
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Wikipedia Entry</p>
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700">+</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Map */}
            <div className={`flex-1 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 relative z-0 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
                {/* Floating Navigation Controls on Map */}
                {isRideMode && myLocation && (
                    <div className="absolute top-4 right-4 z-[9999] flex flex-col gap-2">
                        <Button
                            size="icon"
                            className="w-12 h-12 rounded-full shadow-xl bg-white text-indigo-600 hover:bg-indigo-50 border-2 border-indigo-100"
                            onClick={enterNavMode}
                            title="Recenter & Zoom (Navigation Mode)"
                        >
                            <Navigation className="w-6 h-6 fill-current" />
                        </Button>
                    </div>
                )}

                <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url={isRideMode
                            ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        }
                    />
                    <MapEvents onMapClick={handleMapClick} />
                    <MapController center={viewCenter} zoom={viewZoom} />

                    {/* Route Line */}
                    {isRideMode && routeCoords.length > 0 && (
                        <Polyline positions={routeCoords} color="#4F46E5" weight={5} opacity={0.8} />
                    )}

                    {/* My Location Marker */}
                    {isRideMode && myLocation && (
                        <Marker position={myLocation} icon={L.icon({
                            iconUrl: user?.image || 'https://github.com/shadcn.png',
                            iconSize: [48, 48], // Bigger for avatar
                            className: "rounded-full border-4 border-white shadow-2xl", // Circle avatar style
                            iconAnchor: [24, 24],
                            popupAnchor: [0, -28],
                        })}>
                            <Popup className="font-bold text-sm">You (Live)</Popup>
                        </Marker>
                    )}

                    {/* Live Participants */}
                    {isRideMode && participants.map(p => {
                        if (p.latitude && p.longitude && p.status === 'approved') {
                            return (
                                <Marker key={p.id} position={[p.latitude, p.longitude]} icon={L.icon({
                                    iconUrl: p.image || 'https://github.com/shadcn.png',
                                    iconSize: [40, 40],
                                    className: "rounded-full border-2 border-white shadow-lg"
                                })}>
                                    <Popup className="font-bold text-sm">
                                        {p.name || 'Rider'}
                                    </Popup>
                                </Marker>
                            );
                        }
                        return null;
                    })}

                    {markers.map((marker, i) => (
                        <Marker key={marker.id} position={[marker.lat, marker.lng]}>
                            <Popup className="rounded-xl overflow-hidden p-0 border-none shadow-xl">
                                <div className="w-48 p-0">
                                    {marker.image && (
                                        <div className="h-24 w-full relative">
                                            <img src={marker.image} alt={marker.name} className="w-full h-full object-cover rounded-t-xl" />
                                        </div>
                                    )}
                                    <div className="p-3 bg-white rounded-b-xl">
                                        <h3 className="font-bold text-sm text-slate-900 mb-1 leading-tight">{i + 1}. {marker.name}</h3>
                                        <div className="flex gap-2 mt-2">
                                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${marker.lat},${marker.lng}`, '_blank')}>Open</Button>
                                            <Button size="sm" variant="destructive" className="h-7 w-7 p-0 rounded-lg shrink-0" onClick={(e) => { e.stopPropagation(); removeMarker(marker.id); }}><Trash2 className="w-3 h-3" /></Button>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
