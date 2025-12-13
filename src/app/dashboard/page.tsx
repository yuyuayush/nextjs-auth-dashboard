import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDashboardPosts } from "@/app/actions/post";
import UserGallery from "@/components/dashboard/UserGallery";
import ShareProfileButton from "@/components/dashboard/ShareProfileButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/auth/signin");
  }

  const posts = await getDashboardPosts();

  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      <div className="container mx-auto max-w-7xl py-12 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Gallery</h1>
            <p className="text-gray-500 mt-1">Manage, share, and organize your photo collection.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">

            <ShareProfileButton userId={session.user.id} />

            <Link href="/dashboard/upload">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-full px-6">
                <Upload className="w-4 h-4 mr-2" />
                Upload New
              </Button>
            </Link>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="min-h-[500px]">
          <UserGallery posts={posts} />
        </div>
      </div>
    </div>
  );
}