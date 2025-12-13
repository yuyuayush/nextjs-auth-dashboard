'use client';

import CreatePost from '@/components/gallery/CreatePost';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function UploadPage() {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-8 border-b">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Upload New Photos
                        </CardTitle>
                        <CardDescription className="text-gray-500 text-base mt-2">
                            Share your moments with the world or keep them private.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 px-6 md:px-10 pb-10">
                        <CreatePost />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
