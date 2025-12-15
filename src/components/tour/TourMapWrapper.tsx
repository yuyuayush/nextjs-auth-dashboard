"use client";

import dynamic from "next/dynamic";
import React from "react";

const TourMap = dynamic(() => import("./TourMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[85dvh] bg-slate-100 animate-pulse rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-slate-400">
            Loading Map...
        </div>
    )
});

import { ErrorBoundary } from "react-error-boundary";
import { Button } from "../ui/button";

function MapFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <div className="w-full h-[85dvh] bg-red-50 rounded-2xl border-4 border-red-100 flex flex-col items-center justify-center text-red-600 gap-4 p-4">
            <h3 className="font-bold text-lg">Map Error</h3>
            <p className="text-sm text-center max-w-md bg-white p-2 rounded border border-red-200">{error.message}</p>
            <Button onClick={() => {
                localStorage.removeItem("tour_plan");
                resetErrorBoundary();
                window.location.reload();
            }} variant="destructive">
                Reset Map & Reload
            </Button>
        </div>
    );
}

export default function TourMapWrapper({ user }: { user?: any }) {
    return (
        <ErrorBoundary FallbackComponent={MapFallback}>
            <TourMap user={user} />
        </ErrorBoundary>
    );
}
