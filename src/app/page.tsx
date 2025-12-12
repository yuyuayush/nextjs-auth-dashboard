import LandingHero from "@/components/landing/LandingHero";
import GalleryFeed from "@/components/gallery/GalleryFeed";
import { getPublicPosts } from "@/app/actions/post";
import Link from 'next/link';

export default async function Home() {
  const posts = await getPublicPosts();

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <LandingHero />

      <section id="gallery" className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Community Gallery</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">See what others are creating and sharing.</p>
        </div>

        <div className="flex justify-center mb-16">
          <Link href="/dashboard">
            <button className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Go to My Dashboard
            </button>
          </Link>
        </div>

        <GalleryFeed posts={posts} />
      </section>
    </main>
  );
}