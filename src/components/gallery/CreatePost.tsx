'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPost } from '@/app/actions/post';
import { toast } from 'sonner';
import { Loader2, Upload, Images, Globe, Lock } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

export default function CreatePost() {
    const [loading, setLoading] = useState(false);
    const [fileCount, setFileCount] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            const res = await createPost(formData);
            if (res.success) {
                toast.success(res.count ? `Successfully uploaded ${res.count} photos!` : 'Post created successfully!');
                const form = document.getElementById('create-post-form') as HTMLFormElement;
                form?.reset();
                setFileCount(0);
                setPreviewUrl(null);
            }
        } catch (error) {
            toast.error('Failed to create post');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setFileCount(files.length);

        if (files.length === 1) {
            const file = files[0];
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    return (
        <form id="create-post-form" action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="image">Photos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer relative bg-gray-50/50 hover:bg-blue-50/50 overflow-hidden min-h-[200px]">
                    <input
                        type="file"
                        name="image"
                        id="image"
                        accept="image/*"
                        multiple
                        required
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                    />

                    {previewUrl && fileCount === 1 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                    ) : fileCount > 0 ? (
                        <div className="flex flex-col items-center">
                            <Images className="w-10 h-10 mb-2 text-blue-600" />
                            <span className="text-lg font-semibold text-blue-700">{fileCount} photos selected</span>
                            <span className="text-sm">Click to add more or change</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="w-10 h-10 mb-2" />
                            <span className="text-sm font-medium">Click to upload photos</span>
                            <span className="text-xs text-gray-400 mt-1">Support multiple files</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="caption">Caption (Optional)</Label>
                    <Input type="text" name="caption" id="caption" placeholder="Add a caption for your photos..." />
                </div>

                <div className="flex items-center space-x-2 border p-4 rounded-lg bg-gray-50">
                    <Checkbox id="isPublic" name="isPublic" value="true" />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="isPublic"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                        >
                            <Globe className="w-4 h-4 text-blue-500" />
                            Make Public
                        </label>
                        <p className="text-sm text-muted-foreground">
                            Public posts appear on the main landing page. Unchecked posts are private to your dashboard.
                        </p>
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 text-base">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {loading ? 'Uploading...' : `Upload ${fileCount > 0 ? fileCount : ''} Photos`}
            </Button>
        </form>
    );
}
