"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
// @ts-ignore
import jsnes from "@/lib/jsnes";
import TouchControls from "./TouchControls";
import { Loader2, FileUp, Upload, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Uploader Component inline update
function RomUploader({ gameTitle, onUpload, onCancel, externalUrl }: any) {
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
                toast.error("Please upload a valid .nes ROM file.");
            }
        }
    }, [onUpload]);

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                className={cn(
                    "bg-[#111] border-2 border-dashed rounded-3xl p-8 max-w-lg w-full text-center transition-all duration-300 shadow-2xl shadow-purple-900/20",
                    isDragging ? "border-purple-500 bg-zinc-900 scale-105" : "border-zinc-800"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <button onClick={onCancel} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                    ✕
                </button>

                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                    <FileUp className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Load {gameTitle}</h3>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                    Drag & Drop your <strong>.nes</strong> file here to play instantly.
                </p>

                <div className="grid gap-4">
                    {externalUrl && (
                        <a
                            href={externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black py-4 px-6 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40"
                        >
                            <ExternalLink className="w-5 h-5" />
                            PLAY NOW (Online)
                        </a>
                    )}

                    {externalUrl && (
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-zinc-800"></div>
                            <span className="flex-shrink mx-4 text-zinc-600 text-xs uppercase font-bold tracking-widest leading-none">OR LOAD ROM</span>
                            <div className="flex-grow border-t border-zinc-800"></div>
                        </div>
                    )}

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "w-full font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-sm",
                            externalUrl ? "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700" : "bg-white text-black hover:bg-zinc-200 py-4 text-base"
                        )}
                    >
                        <Upload className="w-4 h-4" />
                        {externalUrl ? "I have the ROM file" : "Select ROM File"}
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                        if (e.target.files?.[0]) onUpload(e.target.files[0]);
                    }}
                    accept=".nes"
                    className="hidden"
                />
            </div>
        </div>
    );
}

interface NesPlayerProps {
    romUrl?: string;
    gameTitle?: string;
    externalUrl?: string;
    onExit: () => void;
}

export default function NesPlayer({ romUrl, gameTitle = "Game", externalUrl, onExit }: NesPlayerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [nes, setNes] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const animationFrameRef = useRef<number>(0);
    const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);

    // Uploader State
    const [showUploader, setShowUploader] = useState(false);
    const [localRomData, setLocalRomData] = useState<string | null>(null);

    // Initialize Audio
    const initAudio = useCallback(() => {
        if (!window.AudioContext && !(window as any).webkitAudioContext) return null;
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        return ctx;
    }, []);

    useEffect(() => {
        // Prevent default touch actions to stop scrolling while playing
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    // Initialize NES
    useEffect(() => {
        const SCREEN_WIDTH = 256;
        const SCREEN_HEIGHT = 240;
        const FRAMEBUFFER_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        const buf = new ArrayBuffer(imageData.data.length);
        const buf8 = new Uint8ClampedArray(buf);
        const buf32 = new Uint32Array(buf);

        // Initialize Audio Context
        const audioCtx = initAudio();
        setAudioContext(audioCtx);

        const nesInstance = new jsnes.NES({
            onFrame: (buffer: number[]) => {
                let i = 0;
                for (let y = 0; y < SCREEN_HEIGHT; ++y) {
                    for (let x = 0; x < SCREEN_WIDTH; ++x) {
                        i = y * 256 + x;
                        buf32[i] = 0xff000000 | buffer[i]; // Full alpha
                    }
                }
                imageData.data.set(buf8);
                ctx.putImageData(imageData, 0, 0);
            },
            onAudioSample: (left: number, right: number) => {
                // Audio stub
            },
        });

        if (audioCtx) {
            const scriptProcessor = audioCtx.createScriptProcessor(512, 0, 1);
            scriptProcessor.onaudioprocess = (e) => {
                // Audio buffer stub
            };
        }

        setNes(nesInstance);

        const KEYMAP: { [key: string]: number } = {
            ArrowUp: 4,
            ArrowDown: 5,
            ArrowLeft: 6,
            ArrowRight: 7,
            z: 0, // A
            Z: 0,
            x: 1, // B
            X: 1,
            a: 0, // A
            s: 1, // B
            Enter: 3, // Start
            Shift: 2, // Select
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (KEYMAP[e.key] !== undefined) {
                nesInstance.buttonDown(1, KEYMAP[e.key]);
                e.preventDefault();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (KEYMAP[e.key] !== undefined) {
                nesInstance.buttonUp(1, KEYMAP[e.key]);
                e.preventDefault();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        // Logic to Load ROM
        const loadGame = async () => {
            setIsLoading(true);
            try {
                let binaryString = "";

                if (localRomData) {
                    binaryString = localRomData;
                } else if (romUrl) {
                    const res = await fetch(romUrl);
                    if (!res.ok) {
                        console.warn("ROM not found on server, asking user for file.");
                        setShowUploader(true);
                        setIsLoading(false);
                        return;
                    }
                    const arrayBuffer = await res.arrayBuffer();
                    const romData = new Uint8Array(arrayBuffer);
                    for (let i = 0; i < romData.length; i++) {
                        binaryString += String.fromCharCode(romData[i]);
                    }
                } else {
                    setShowUploader(true);
                    setIsLoading(false);
                    return;
                }

                if (binaryString) {
                    nesInstance.loadROM(binaryString);
                    setIsLoading(false);
                    setIsPlaying(true);
                    setShowUploader(false);
                }

            } catch (err) {
                console.error(err);
                if (!showUploader) toast.error("Failed to load game.");
                setShowUploader(true);
                setIsLoading(false);
            }
        };

        loadGame();

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioCtx) audioCtx.close();
        };
    }, [romUrl, localRomData, initAudio]);

    useEffect(() => {
        if (!nes || !isPlaying) return;

        const onAnimationFrame = () => {
            try {
                nes.frame();
                animationFrameRef.current = requestAnimationFrame(onAnimationFrame);
            }
            catch (e) {
                console.error("NES crash", e);
                setIsPlaying(false);
            }
        };

        animationFrameRef.current = requestAnimationFrame(onAnimationFrame);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [nes, isPlaying]);

    const handleTouchInput = (button: number, pressed: boolean) => {
        if (!nes) return;
        if (pressed) nes.buttonDown(1, button);
        else nes.buttonUp(1, button);
    };

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const arrayBuffer = e.target?.result;
            if (arrayBuffer instanceof ArrayBuffer) {
                const romData = new Uint8Array(arrayBuffer);
                let binaryString = "";
                for (let i = 0; i < romData.length; i++) {
                    binaryString += String.fromCharCode(romData[i]);
                }
                setLocalRomData(binaryString);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono">
            {showUploader && (
                <div className="absolute inset-0 z-[60]">
                    <RomUploader
                        gameTitle={gameTitle}
                        onUpload={handleFileUpload}
                        externalUrl={externalUrl}
                        onCancel={onExit}
                    />
                </div>
            )}

            <div className="absolute top-4 left-0 w-full flex justify-between items-center px-6 z-10">
                <div className="text-white/80 text-sm flex gap-4">
                    <span>PLAYER 1</span>
                    <span className="hidden md:inline text-white/50">Controls: Arrows, Z(A), X(B), Enter(Start)</span>
                </div>
                <button
                    onClick={onExit}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md transition-colors text-sm font-bold"
                >
                    EXIT GAME
                </button>
            </div>

            <div className="relative aspect-[256/240] h-auto w-full max-w-[90vw] md:max-h-[80vh] bg-black shadow-2xl ring-8 ring-gray-900 rounded-lg overflow-hidden">
                {isLoading && !showUploader && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <span className="ml-3">Loading {gameTitle}...</span>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    width={256}
                    height={240}
                    className="w-full h-full object-contain image-pixelated"
                    style={{ imageRendering: "pixelated" }}
                />
            </div>

            <div className="md:hidden">
                <TouchControls onInput={handleTouchInput} />
            </div>
        </div>
    );
}
