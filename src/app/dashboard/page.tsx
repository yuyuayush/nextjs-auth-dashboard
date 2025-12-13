import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDashboardPosts } from "@/app/actions/post";
import UserGallery from "@/components/dashboard/UserGallery";
import CreatePost from "@/components/gallery/CreatePost";
import ShareProfileButton from "@/components/dashboard/ShareProfileButton";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/auth/signin");
  }

  const posts = await getDashboardPosts();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your gallery and uploads.</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div>
              <p className="text-sm text-gray-900 font-medium">{session.user.name}</p>
              <p className="text-xs text-text-gray-500">{session.user.email}</p>
            </div>
            <ShareProfileButton userId={session.user.id} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Photos</h2>
              <CreatePost />
            </div>
          </div>

          {/* Right Column: Gallery */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">My Gallery</h2>
            <UserGallery posts={posts} />
          </div>
        </div>
      </div>

    </div>
  );
}