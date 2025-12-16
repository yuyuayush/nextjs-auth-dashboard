"use client";

import { ArrowBigDown, ArrowBigLeft, ArrowBigRight, ArrowBigUp } from "lucide-react";
import React from "react";

interface TouchControlsProps {
    onInput: (button: number, pressed: boolean) => void;
}

// Access the JSNES controller mapping if available, otherwise define our own matching standard NES
const BUTTONS = {
    A: 0,
    B: 1,
    SELECT: 2,
    START: 3,
    UP: 4,
    DOWN: 5,
    LEFT: 6,
    RIGHT: 7,
};

export default function TouchControls({ onInput }: TouchControlsProps) {
    const handleTouch = (button: number, pressed: boolean) => (e: React.TouchEvent | React.MouseEvent) => {
        // e.preventDefault();
        onInput(button, pressed);
    };

    return (
        <div className="absolute bottom-4 left-0 w-full px-8 pb-4 flex justify-between items-end z-20 touch-none select-none">
            {/* D-Pad */}
            <div className="relative w-40 h-40">
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                    <button
                        className="w-14 h-14 bg-gray-800/80 rounded-lg flex items-center justify-center active:bg-blue-600/80 transition-colors shadow-lg border border-white/10"
                        onTouchStart={handleTouch(BUTTONS.UP, true)}
                        onTouchEnd={handleTouch(BUTTONS.UP, false)}
                        onMouseDown={handleTouch(BUTTONS.UP, true)}
                        onMouseUp={handleTouch(BUTTONS.UP, false)}
                    >
                        <ArrowBigUp className="text-white w-8 h-8" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                    <button
                        className="w-14 h-14 bg-gray-800/80 rounded-lg flex items-center justify-center active:bg-blue-600/80 transition-colors shadow-lg border border-white/10"
                        onTouchStart={handleTouch(BUTTONS.DOWN, true)}
                        onTouchEnd={handleTouch(BUTTONS.DOWN, false)}
                        onMouseDown={handleTouch(BUTTONS.DOWN, true)}
                        onMouseUp={handleTouch(BUTTONS.DOWN, false)}
                    >
                        <ArrowBigDown className="text-white w-8 h-8" />
                    </button>
                </div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <button
                        className="w-14 h-14 bg-gray-800/80 rounded-lg flex items-center justify-center active:bg-blue-600/80 transition-colors shadow-lg border border-white/10"
                        onTouchStart={handleTouch(BUTTONS.LEFT, true)}
                        onTouchEnd={handleTouch(BUTTONS.LEFT, false)}
                        onMouseDown={handleTouch(BUTTONS.LEFT, true)}
                        onMouseUp={handleTouch(BUTTONS.LEFT, false)}
                    >
                        <ArrowBigLeft className="text-white w-8 h-8" />
                    </button>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <button
                        className="w-14 h-14 bg-gray-800/80 rounded-lg flex items-center justify-center active:bg-blue-600/80 transition-colors shadow-lg border border-white/10"
                        onTouchStart={handleTouch(BUTTONS.RIGHT, true)}
                        onTouchEnd={handleTouch(BUTTONS.RIGHT, false)}
                        onMouseDown={handleTouch(BUTTONS.RIGHT, true)}
                        onMouseUp={handleTouch(BUTTONS.RIGHT, false)}
                    >
                        <ArrowBigRight className="text-white w-8 h-8" />
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 items-center">
                <div className="flex gap-4 mb-2">
                    <div className="flex flex-col items-center gap-1">
                        <button
                            className="w-16 h-8 bg-gray-600 rounded-full border border-gray-400 active:bg-gray-500 shadow-md"
                            onTouchStart={handleTouch(BUTTONS.SELECT, true)}
                            onTouchEnd={handleTouch(BUTTONS.SELECT, false)}
                            onMouseDown={handleTouch(BUTTONS.SELECT, true)}
                            onMouseUp={handleTouch(BUTTONS.SELECT, false)}
                        />
                        <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Select</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <button
                            className="w-16 h-8 bg-gray-600 rounded-full border border-gray-400 active:bg-gray-500 shadow-md"
                            onTouchStart={handleTouch(BUTTONS.START, true)}
                            onTouchEnd={handleTouch(BUTTONS.START, false)}
                            onMouseDown={handleTouch(BUTTONS.START, true)}
                            onMouseUp={handleTouch(BUTTONS.START, false)}
                        />
                        <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Start</span>
                    </div>
                </div>

                <div className="flex gap-6 items-end">
                    <div className="flex flex-col items-center gap-2">
                        <button
                            className="w-16 h-16 bg-red-600/90 rounded-full border-4 border-red-800 active:bg-red-500 shadow-xl flex items-center justify-center"
                            onTouchStart={handleTouch(BUTTONS.B, true)}
                            onTouchEnd={handleTouch(BUTTONS.B, false)}
                            onMouseDown={handleTouch(BUTTONS.B, true)}
                            onMouseUp={handleTouch(BUTTONS.B, false)}
                        >
                            <span className="font-black text-red-900 text-xl">B</span>
                        </button>
                    </div>
                    <div className="flex flex-col items-center gap-2 -mt-8">
                        <button
                            className="w-16 h-16 bg-red-600/90 rounded-full border-4 border-red-800 active:bg-red-500 shadow-xl flex items-center justify-center"
                            onTouchStart={handleTouch(BUTTONS.A, true)}
                            onTouchEnd={handleTouch(BUTTONS.A, false)}
                            onMouseDown={handleTouch(BUTTONS.A, true)}
                            onMouseUp={handleTouch(BUTTONS.A, false)}
                        >
                            <span className="font-black text-red-900 text-xl">A</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
