"use client";

import React, { useState } from 'react';
import MasonryGrid from '@/components/ui/MasonryGrid';
import { motion } from 'framer-motion';
import NesPlayer from '@/components/games/NesPlayer';
import { Gamepad2, Play, Search } from 'lucide-react';

const GAMES = [
    {
        id: 'lawn_mower',
        title: 'Lawn Mower (Demo)',
        category: 'Action',
        image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=2069&auto=format&fit=crop',
        rom: '/games/lawn_mower.nes',
        description: 'A classic public domain demo game. Mow the lawn!'
    },
    {
        id: 'mario',
        title: 'Super Mario Bros',
        category: 'Platformer',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wmk.png',
        rom: '/games/mario.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/super-mario-bros.html',
        description: 'The definitive platformer. Rescue Princess Toadstool from Bowser.'
    },
    {
        id: 'contra',
        title: 'Contra',
        category: 'Shooter',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20d2.png',
        rom: '/games/contra.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/contra-usa.html',
        description: 'Legendary run-and-gun action. Up, Up, Down, Down...'
    },
    {
        id: 'zelda',
        title: 'The Legend of Zelda',
        category: 'Adventure',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3905.png',
        rom: '/games/zelda.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/legend-of-zelda-the-usa.html',
        description: 'It\'s dangerous to go alone! Take this.'
    },
    {
        id: 'metroid',
        title: 'Metroid',
        category: 'Adventure',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1hni.png',
        rom: '/games/metroid.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/metroid-usa.html',
        description: 'Explore the depths of planet Zebes as Samus Aran.'
    },
    {
        id: 'megaman2',
        title: 'Mega Man 2',
        category: 'Action',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7d.png',
        rom: '/games/megaman2.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/mega-man-2-usa.html',
        description: 'Defeat Dr. Wily and his 8 Robot Masters.'
    },
    {
        id: 'punchout',
        title: 'Mike Tyson\'s Punch-Out!!',
        category: 'Sports',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1yej.png',
        rom: '/games/punchout.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/mike-tyson-s-punch-out-usa-rev-a.html',
        description: 'Join Little Mac in the ring to become the champion.'
    },
    {
        id: 'tetris',
        title: 'Tetris',
        category: 'Puzzle',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1h8r.png',
        rom: '/games/tetris.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/tetris-usa.html',
        description: 'The timeless puzzle game. Clear lines, score points.'
    },
    {
        id: 'excitebike',
        title: 'Excitebike',
        category: 'Racing',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wmo.png',
        rom: '/games/excitebike.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/excitebike-japan-usa.html',
        description: 'Motocross racing with a custom track editor.'
    },
    {
        id: 'castlevania',
        title: 'Castlevania',
        category: 'Action',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2230.png',
        rom: '/games/castlevania.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/castlevania-usa.html',
        description: 'Step into the shadows of the vampire\'s castle.'
    },
    {
        id: 'kirby',
        title: 'Kirby\'s Adventure',
        category: 'Platformer',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7l.png',
        rom: '/games/kirby.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/kirby-s-adventure-usa.html',
        description: 'Copy abilities and save Dream Land.'
    },
    {
        id: 'marioworld',
        title: 'Super Mario Bros 3',
        category: 'Platformer',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png',
        rom: '/games/mario3.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/super-mario-bros-3-usa-rev-a.html',
        description: 'Fly with the Tanooki suit in this massive sequel.'
    },
    {
        id: 'pacman',
        title: 'Pac-Man',
        category: 'Arcade',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.png',
        rom: '/games/pacman.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/pac-man-usa-namco.html',
        description: 'Waka waka waka! Eat all the dots and avoid ghosts.'
    },
    {
        id: 'donkeykong',
        title: 'Donkey Kong',
        category: 'Arcade',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1ycw.png',
        rom: '/games/donkeykong.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/donkey-kong-classics-usa.html',
        description: 'Help Mario save Pauline from the giant ape.'
    },
    {
        id: 'finalfantasy',
        title: 'Final Fantasy',
        category: 'RPG',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vcf.png',
        rom: '/games/finalfantasy.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/final-fantasy-usa.html',
        description: 'The RPG that started it all. Restore the crystals!'
    },
    {
        id: 'ninjagaiden',
        title: 'Ninja Gaiden',
        category: 'Action',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7e.png',
        rom: '/games/ninjagaiden.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/ninja-gaiden-usa.html',
        description: 'Fast-paced ninja action with cinematic storytelling.'
    },
    {
        id: 'duckhunt',
        title: 'Duck Hunt',
        category: 'Shooter',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7g.png',
        rom: '/games/duckhunt.nes',
        externalUrl: 'https://www.retrogames.cc/nes-games/duck-hunt-usa.html',
        description: 'Aim and fire! Watch out for the laughing dog.'
    }
];

export default function GamesPage() {
    const [activeGameId, setActiveGameId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const activeGame = GAMES.find(g => g.id === activeGameId);

    const filteredGames = GAMES.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Player Overlay */}
            {activeGameId && activeGame && (
                <NesPlayer
                    romUrl={activeGame.rom}
                    gameTitle={activeGame.title}
                    // @ts-ignore
                    externalUrl={activeGame.externalUrl}
                    onExit={() => setActiveGameId(null)}
                />
            )}

            {/* Hero Section */}
            <div className="relative border-b border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-blue-900/20" />

                <div className="container mx-auto px-4 pt-20 pb-20 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6 animate-in slide-in-from-left-4 fade-in duration-500">
                                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                                    Retro Center
                                </span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 tracking-tighter mb-6 drop-shadow-2xl">
                                Arcade<br />
                                <span className="text-white">Universe</span>
                            </h1>
                            <p className="text-gray-400 max-w-xl text-xl leading-relaxed font-light">
                                Dive into the golden age of gaming. Play legendary titles directly in your browser.
                                <span className="text-purple-400 font-medium"> No setup required.</span>
                            </p>
                        </div>

                        <div className="w-full md:w-auto relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-white transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Find your childhood..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-96 bg-black/50 backdrop-blur-md border border-white/10 rounded-full py-4 pl-12 pr-6 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <MasonryGrid
                    breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {filteredGames.map((game, index) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-1 cursor-pointer mb-6"
                            onClick={() => setActiveGameId(game.id)}
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[3/4] overflow-hidden">
                                <img
                                    src={game.image}
                                    alt={game.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-xl">
                                        <Play className="w-8 h-8 text-white fill-current translate-x-1" />
                                    </div>
                                </div>

                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10">
                                    {game.category}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-purple-400 transition-colors">
                                    {game.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {game.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </MasonryGrid>

                {filteredGames.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>No games found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
