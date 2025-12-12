import { Button } from "@/components/ui/button";
import { Share2, Link as LinkIcon, Lock } from "lucide-react";
import { toast } from "sonner";
import { generateShareToken } from "@/app/actions/post";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ShareProfileButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);

    const handleSharePublic = async () => {
        const url = `${window.location.origin}/gallery/${userId}`;
        await copyToClipboard(url, "Public profile link copied!");
    };

    const handleShareSecret = async () => {
        setLoading(true);
        try {
            const token = await generateShareToken();
            const url = `${window.location.origin}/gallery/${userId}?token=${token}`;
            await copyToClipboard(url, "Secret (Full Access) link copied!");
        } catch (error) {
            toast.error("Failed to generate link");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string, msg: string) => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            toast.success(msg);
        } else {
            toast.error("Clipboard not supported");
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2 text-xs h-8">
                    <Share2 className="w-3 h-3" /> Share Gallery
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSharePublic}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copy Public Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareSecret} disabled={loading} className="text-amber-700 focus:text-amber-800 focus:bg-amber-50">
                    <Lock className="w-4 h-4 mr-2" />
                    Copy Secret Link (View All)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
