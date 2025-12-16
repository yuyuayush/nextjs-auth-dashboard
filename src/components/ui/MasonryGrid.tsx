"use client";

import React, { useState, useEffect, useRef } from 'react';

interface MasonryGridProps {
    breakpointCols?: number | { default: number;[key: number]: number };
    className?: string;
    columnClassName?: string;
    children: React.ReactNode;
}

export default function MasonryGrid({
    breakpointCols = 3,
    className = "",
    columnClassName = "",
    children
}: MasonryGridProps) {
    const [columnCount, setColumnCount] = useState<number>(3);

    // Calculate column count based on window width and breakpoints
    useEffect(() => {
        const updateColumns = () => {
            if (typeof breakpointCols === 'number') {
                setColumnCount(breakpointCols);
                return;
            }

            const width = window.innerWidth;
            let matchedBreakpoints = Object.keys(breakpointCols)
                .map(Number)
                .filter(bp => !isNaN(bp))
                .sort((a, b) => b - a); // Descending

            let found = false;
            for (const bp of matchedBreakpoints) {
                if (width <= bp) {
                    setColumnCount(breakpointCols[bp]);
                    found = true;
                }
            }

            if (!found) {
                setColumnCount(breakpointCols.default || 3);
            }
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, [breakpointCols]);

    const childrenArray = React.Children.toArray(children);
    const columns: React.ReactNode[][] = Array.from({ length: columnCount }, () => []);

    // Distribute children into columns
    childrenArray.forEach((child, index) => {
        columns[index % columnCount].push(child);
    });

    return (
        <div className={`flex w-auto ${className}`}>
            {columns.map((col, i) => (
                <div
                    key={i}
                    className={`flex flex-col bg-clip-padding ${columnClassName}`}
                >
                    {col}
                </div>
            ))}
        </div>
    );
}
