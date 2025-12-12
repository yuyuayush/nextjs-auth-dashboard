'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, ContactShadows, Environment } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function FloatingShape({ position, color, geometry }: { position: [number, number, number], color: string, geometry: any }) {
    const mesh = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.x = Math.sin(state.clock.elapsedTime / 2) * 0.2;
            mesh.current.rotation.y = Math.sin(state.clock.elapsedTime / 4) * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <mesh ref={mesh} position={position}>
                {geometry}
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
            </mesh>
        </Float>
    );
}

function HeroScene() {
    return (
        <>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

            <FloatingShape position={[-2, 1, 0]} color="#ff6b6b" geometry={<torusGeometry args={[0.8, 0.3, 16, 32]} />} />
            <FloatingShape position={[2.5, -0.5, -1]} color="#4ecdc4" geometry={<octahedronGeometry args={[1]} />} />
            <FloatingShape position={[0, -2, -2]} color="#ffe66d" geometry={<sphereGeometry args={[0.8, 32, 32]} />} />

            <ContactShadows resolution={1024} scale={50} blur={2.5} opacity={0.5} far={10} color="#000000" />
        </>
    );
}

export default function LandingHero() {
    return (
        <div className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 to-white">
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    <Suspense fallback={null}>
                        <HeroScene />
                    </Suspense>
                </Canvas>
            </div>

            <div className="relative z-10 text-center space-y-6 pointer-events-none p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="pointer-events-auto"
                >
                    <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tight mb-4 drop-shadow-xl">
                        Create. <span className="text-blue-600">Share.</span> Inspire.
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8 font-light">
                        Your world in 3D. Join the community and showcase your imagination.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/signup">
                            <Button size="lg" className="px-8 text-lg py-6 rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="#gallery">
                            <Button size="lg" variant="outline" className="px-8 text-lg py-6 rounded-full hover:scale-105 transition-transform cursor-pointer">
                                View Gallery
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
