import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAllUsersWithStatus } from "@/app/actions/friends";
import ChatInterface from "@/components/chat/ChatInterface";

export default async function ChatPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        redirect("/auth/signin");
    }

    // Server-fetch initial data
    const usersWithStatus = await getAllUsersWithStatus();

    return (
        <div className="h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <ChatInterface
                    initialUsers={usersWithStatus}
                    currentUserId={session.user.id}
                />
            </div>
        </div>
    );
}
