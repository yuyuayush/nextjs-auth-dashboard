import { Metadata } from "next";
import TourMapWrapper from "@/components/tour/TourMapWrapper";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
    title: "Tour Plan | FriendHub",
    description: "Plan your dream trip with offline capability.",
};

// Force dynamic since we use client components/interactions heavily
export const dynamic = 'force-dynamic';

export default async function TourPlanPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-40 pointer-events-none" />

            <div className="container mx-auto p-4 md:p-8 relative z-10">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Plan Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Adventure</span>
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Create your itinerary, explore recommendations, and save your map offline.
                    </p>
                </div>

                <TourMapWrapper user={session?.user} />
            </div>
        </div>
    );
}
