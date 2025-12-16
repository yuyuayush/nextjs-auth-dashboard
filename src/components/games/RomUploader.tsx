"use client";

import React, { useCallback, useRef } from 'react';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RomUploaderProps {
    gameTitle: string;
    onUpload: (file: File) => void;
    onCancel: () => void;
}

export default function RomUploader({ gameTitle, onUpload, onCancel }: RomUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.name.toLowerCase().endsWith('.nes')) {
                onUpload(file);
            } else {
                alert("Please upload a valid .nes ROM file.");
            }
        }
    }, [onUpload]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                className={cn(
                    "bg-zinc-900 border-2 border-dashed rounded-2xl p-8 max-w-md w-full text-center transition-all duration-300",
                    isDragging ? "border-purple-500 bg-zinc-800 scale-105" : "border-zinc-700 hover:border-zinc-600"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileUp className="w-10 h-10 text-purple-400" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Upload {gameTitle}</h3>
                <p className="text-zinc-400 mb-6">
                    We couldn't find this game on our server. <br />
                    Drag & Drop your <strong>.nes</strong> file here to play!
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Upload className="w-5 h-5" />
                        Select ROM File
                    </button>
                    <button
                        onClick={onCancel}
                        className="text-zinc-500 hover:text-white font-medium text-sm mt-2 transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".nes"
                    className="hidden"
                />

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-600 bg-zinc-950/50 p-2 rounded-lg">
                    <AlertCircle className="w-3 h-3" />
                    <span>File is loaded locally. We do not host ROMs.</span>
                </div>
            </div>
        </div>
    );
}
