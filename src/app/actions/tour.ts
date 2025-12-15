"use server";

export async function searchPlaces(query: string) {
    if (!query) return [];

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`, {
            headers: {
                'User-Agent': 'FriendHub-TourPlan/1.0',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        return data.map((item: any) => ({
            id: item.place_id.toString(),
            name: item.display_name.split(',')[0],
            fullName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: item.type || 'place',
            rating: (4 + Math.random()).toFixed(1)
        }));
    } catch (error) {
        console.error("Search failed:", error);
        return [];
    }
}

export async function getRecommendations(lat: number, lng: number) {
    try {
        // 1. Search for nearby pages (limit 5, radius 10000m)
        const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=10000&gslimit=5&format=json&origin=*`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.query || !geoData.query.geosearch || geoData.query.geosearch.length === 0) {
            return [];
        }

        const pages = geoData.query.geosearch;
        const pageIds = pages.map((p: any) => p.pageid).join('|');

        // 2. Fetch details (images, extracts) for these pages
        const detailsUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&pageids=${pageIds}&pithumbsize=500&exintro&explaintext&exsentences=2&format=json&origin=*`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();

        const places = pages.map((page: any) => {
            const detail = detailsData.query.pages[page.pageid];
            return {
                id: page.pageid.toString(),
                name: page.title,
                lat: page.lat,
                lng: page.lon,
                type: 'attraction',
                rating: (4 + Math.random()).toFixed(1),
                image: detail.thumbnail ? detail.thumbnail.source : null,
                description: detail.extract
            };
        });

        return places;

    } catch (error) {
        console.error("Wikipedia API failed:", error);
        return [];
    }
}

export async function getPlaceName(lat: number, lng: number) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: {
                'User-Agent': 'FriendHub-TourPlan/1.0'
            }
        });
        const data = await response.json();
        return data.display_name?.split(',')[0] || "Unknown Location";
    } catch {
        return "Custom Location";
    }
}
