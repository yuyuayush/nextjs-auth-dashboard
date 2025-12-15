"use client";

import dynamic from "next/dynamic";
import React from "react";

const TourMap = dynamic(() => import("./TourMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[85vh] bg-slate-100 animate-pulse rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-slate-400">
            Loading Map...
        </div>
    )
});

export default function TourMapWrapper({ user }: { user?: any }) {
    return <TourMap user={user} />;
}
