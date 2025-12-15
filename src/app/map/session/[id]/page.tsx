import SharedMap from "@/components/map/SharedMap";

export default async function SharedMapPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Shared Map Session</h1>
            <p className="text-slate-500 mb-8">Click on the map to add a marker. Share the URL to collaborate.</p>
            <SharedMap sessionId={id} />
        </div>
    );
}
