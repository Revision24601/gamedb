'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { IGame } from '@/models/Game';

// Import modular components
import MindPalaceHeader from './components/MindPalaceHeader';
import MindPalaceIntro from './components/MindPalaceIntro';
import MindPalaceNavigator from './components/MindPalaceNavigator';
import MindPalaceBackground from './components/MindPalaceBackground';
import KeyboardHelper from './components/KeyboardHelper';

// Import room types and interfaces
import { Room, RoomType } from './types';

// Import animations
import './animations.css';

// Import fonts for RPG map styling
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

// Main MindPalace component
export default function MindPalace() {
  // State for rooms and games
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [showInfoTip, setShowInfoTip] = useState(false);
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Background style options
  const [backgroundStyle, setBackgroundStyle] = useState<'gradient' | 'parallax' | 'particles'>('gradient');
  const [backgroundTheme, setBackgroundTheme] = useState<'default' | 'cool' | 'warm' | 'neutral' | 'forest'>('default');
  const [backgroundIntensity, setBackgroundIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Fetch games when component mounts
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/games');
        
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        
        const data = await response.json();
        const gamesData = data.games || [];
        setGames(gamesData);
        
        // Initialize rooms with games assigned to them
        initializeRooms(gamesData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games');
        setLoading(false);
        // Initialize rooms without games
        initializeRooms([]);
      }
    };
    
    fetchGames();
  }, []);
  
  // Initialize rooms with games
  const initializeRooms = (gamesData: IGame[]) => {
    // Define basic room types that can be repeated
    const roomTypes: { type: RoomType, name: string, description: string, isLocked: boolean }[] = [
      { type: 'study', name: 'Study', description: 'For deep analysis of game mechanics and systems. Here you can break down the components of gameplay and understand how they work together.', isLocked: false },
      { type: 'library', name: 'Library', description: 'Collection of game lore, stories, and narrative elements. Store the worldbuilding aspects of games that resonated with you.', isLocked: false },
      { type: 'garden', name: 'Garden', description: 'A peaceful place for aesthetic appreciation. Reflect on visual design, art direction, and the beauty found in games.', isLocked: false },
      { type: 'workshop', name: 'Workshop', description: 'Analyze game systems and designs. Consider how you would modify or improve upon the games you\'ve played.', isLocked: false },
      { type: 'gallery', name: 'Gallery', description: 'Showcase memorable moments and screenshots. Capture and preserve the most impactful visual memories from your gaming experiences.', isLocked: false },
      { type: 'theater', name: 'Theater', description: 'Replay cutscenes and story moments that left an impression. Analyze narrative techniques and storytelling methods.', isLocked: false },
      { type: 'trophy', name: 'Trophy Room', description: 'Display your gaming achievements and accomplishments. Celebrate your gaming milestones and challenges overcome.', isLocked: false },
      { type: 'archive', name: 'Archives', description: 'Historical record of your gaming journey. Track your evolution as a player and the changing landscape of your gaming tastes.', isLocked: false },
    ];
    
    const initialRooms: Room[] = [];
    let roomId = 1;
    
    // Generate room for each game, cycling through room types
    gamesData.forEach((game, index) => {
      // Create a room for this game
      const roomType = roomTypes[index % roomTypes.length];
      initialRooms.push({
        id: roomId++,
        name: roomType.name,
        type: roomType.type,
        description: roomType.description,
        isLocked: false,
        gameId: game._id
      });
    });
    
    // Always add one "Coming Soon" room at the end
    initialRooms.push({
      id: roomId,
      name: 'Coming Soon',
      type: 'locked',
      description: 'Future expansion of your Mind Palace. What other spaces would help you organize your gaming thoughts?',
      isLocked: true
    });
    
    setAllRooms(initialRooms);
  };
  
  // Find game associated with a room
  const getGameForRoom = (room: Room): IGame | undefined => {
    if (!room.gameId) return undefined;
    return games.find(game => game._id === room.gameId);
  };
  
  // Toggle info tip
  const toggleInfoTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfoTip(!showInfoTip);
  };
  
  // Toggle background style
  const cycleBackgroundStyle = () => {
    setBackgroundStyle(prev => {
      if (prev === 'gradient') return 'parallax';
      if (prev === 'parallax') return 'particles';
      return 'gradient';
    });
  };
  
  // Cycle through background themes
  const cycleBackgroundTheme = () => {
    const themes: ('default' | 'cool' | 'warm' | 'neutral' | 'forest')[] = ['default', 'cool', 'warm', 'neutral', 'forest'];
    const currentIndex = themes.indexOf(backgroundTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setBackgroundTheme(themes[nextIndex]);
  };
  
  // Toggle background intensity
  const cycleBackgroundIntensity = () => {
    const intensities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const currentIndex = intensities.indexOf(backgroundIntensity);
    const nextIndex = (currentIndex + 1) % intensities.length;
    setBackgroundIntensity(intensities[nextIndex]);
  };
  
  // Get main container classes
  const getMainContainerClasses = () => {
    return `journal-page p-8 rounded-2xl relative z-10 bg-amber-50/80 dark:bg-amber-900/80 backdrop-blur-md 
      animate-pageIn border border-amber-700/20 dark:border-amber-300/20 ${cinzel.className}`;
  };
  
  // Main renderer
  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-5xl relative">
          <div className="journal-page p-8 rounded-2xl relative z-10 bg-amber-50/80 dark:bg-amber-900/80 backdrop-blur-md">
            <h1 className="journal-title text-center text-amber-900 dark:text-amber-100">Mind Palace</h1>
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-amber-700 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        </main>
      </>
    );
  }
  
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl relative">
        {/* Background Component */}
        <MindPalaceBackground 
          style={backgroundStyle} 
          theme={backgroundTheme}
          intensity={backgroundIntensity}
        />
        
        <div className={getMainContainerClasses()}>
          {/* Header Component */}
          <MindPalaceHeader />
          
          {/* Settings Controls */}
          <div className="mb-4 text-right flex justify-end items-center gap-4">
            <button 
              onClick={cycleBackgroundStyle} 
              className="text-xs text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
            >
              Background: {backgroundStyle}
            </button>
            <button 
              onClick={cycleBackgroundTheme} 
              className="text-xs text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
            >
              Theme: {backgroundTheme}
            </button>
            <button 
              onClick={cycleBackgroundIntensity} 
              className="text-xs text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
            >
              Intensity: {backgroundIntensity}
            </button>
          </div>
          
          {/* Introduction Component */}
          <MindPalaceIntro 
            showInfoTip={showInfoTip} 
            toggleInfoTip={toggleInfoTip}
          />
          
          {/* Keyboard Helper Component */}
          <div className="relative mb-6">
            <KeyboardHelper showInitially={false} />
          </div>
          
          {/* New viewport info */}
          <div className="mb-6 px-5 py-4 bg-amber-700/10 rounded-lg border border-amber-700/30 text-sm">
            <h3 className="font-medium mb-2 text-amber-800 dark:text-amber-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Navigating Your Mind Palace Map
            </h3>
            <p className="mb-2 text-amber-800 dark:text-amber-200">
              Your game rooms are now organized into clusters based on game status:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                <span className="text-amber-800 dark:text-amber-200">Currently Playing</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-amber-800 dark:text-amber-200">Completed</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                <span className="text-amber-800 dark:text-amber-200">Backlog</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                <span className="text-amber-800 dark:text-amber-200">Wishlist</span>
              </div>
            </div>
            <div className="mb-3 border-t border-amber-700/20 pt-3">
              <h4 className="font-medium mb-1 text-amber-800 dark:text-amber-200">Navigation Controls:</h4>
              <ul className="list-disc ml-5 space-y-1 text-amber-800 dark:text-amber-200">
                <li>Move your mouse <b>over the viewport</b> to activate it (indicated by a subtle highlight)</li>
                <li>Click and drag within the viewport to pan around smoothly</li>
                <li>Use mouse wheel to zoom in and out <b>only when your cursor is over the viewport</b></li>
                <li>Press <span className="px-1 border border-amber-700/30 rounded">↑</span><span className="px-1 border border-amber-700/30 rounded">↓</span><span className="px-1 border border-amber-700/30 rounded">←</span><span className="px-1 border border-amber-700/30 rounded">→</span> keys to navigate the map</li>
                <li>Use <span className="px-1 border border-amber-700/30 rounded">+</span> and <span className="px-1 border border-amber-700/30 rounded">-</span> keys to zoom in and out</li>
                <li>Connect a gamepad to navigate with analog sticks (experimental)</li>
                <li>Click on a room to focus on it - click again to enter the game's details</li>
                <li>Press <span className="bg-amber-100 dark:bg-amber-800 px-1 rounded">Esc</span> or use the back button to exit focus mode</li>
                <li>Use the cluster buttons at the bottom left to jump between sections</li>
              </ul>
            </div>
            <div className="border-t border-amber-700/20 pt-3">
              <h4 className="font-medium mb-1 text-amber-800 dark:text-amber-200">Dreamy Background:</h4>
              <p className="text-amber-800 dark:text-amber-200 mb-1">
                The animated background elements represent memories floating through your mind palace.
                You can customize these using the controls in the top-left of the viewport:
              </p>
              <ul className="list-disc ml-5 text-amber-800 dark:text-amber-200">
                <li><b>Theme</b>: Changes the color scheme of the memory particles</li>
                <li><b>Density</b>: Controls how many memory elements appear in the background</li>
              </ul>
            </div>
          </div>
          
          {/* Navigator Component */}
          <MindPalaceNavigator 
            rooms={allRooms}
            getGameForRoom={getGameForRoom}
          />
          
          {/* Development Version Note */}
          <div className="mt-8 p-4 bg-amber-100 dark:bg-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200 
            border border-amber-800/20 dark:border-amber-200/20">
            <h3 className="font-medium mb-1 text-amber-900 dark:text-amber-100">Map Legend</h3>
            <p>
              This cartographer's map of your Mind Palace is an early prototype. 
              Click on a location marker to travel to that game's detailed page. 
              In the future, you'll be able to create your own custom locations and organize games spatially.
            </p>
          </div>
        </div>
      </main>
    </>
  );
} 