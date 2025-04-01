'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { IGame } from '@/models/Game';

// Import modular components
import MindPalaceHeader from './components/MindPalaceHeader';
import MindPalaceIntro from './components/MindPalaceIntro';
import RoomGrid from './components/RoomGrid';
import Pagination from './components/Pagination';
import RoomDetailModal from './components/RoomDetailModal';
import AnimatedBackground from './components/AnimatedBackground';
import KeyboardHelper from './components/KeyboardHelper';

// Import room types and interfaces
import { Room, RoomType, RenderMode, AnimationConfig } from './types';

// Import animations
import './animations.css';

// Number of rooms to show per page
const ROOMS_PER_PAGE = 9;

// Main MindPalace component
export default function MindPalace() {
  const router = useRouter();
  
  // State for rooms, selected room, and games
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [displayedRooms, setDisplayedRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showInfoTip, setShowInfoTip] = useState(false);
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGame, setSelectedGame] = useState<IGame | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionGameId, setTransitionGameId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Render mode can be changed for future enhancements
  const [renderMode, setRenderMode] = useState<RenderMode>('static');
  
  // Animation configuration
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig>({
    enabled: false,
    duration: 300,
    easing: 'ease-in-out'
  });
  
  // Background style options
  const [backgroundStyle, setBackgroundStyle] = useState<'gradient' | 'parallax'>('gradient');
  const [backgroundTheme, setBackgroundTheme] = useState<'default' | 'cool' | 'warm' | 'neutral'>('default');
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
  
  // Update displayed rooms when current page or all rooms change
  useEffect(() => {
    const start = (currentPage - 1) * ROOMS_PER_PAGE;
    const end = start + ROOMS_PER_PAGE;
    setDisplayedRooms(allRooms.slice(start, end));
  }, [currentPage, allRooms]);
  
  // Effect for handling the transition
  useEffect(() => {
    if (isTransitioning && transitionGameId) {
      const timer = setTimeout(() => {
        router.push(`/games/${transitionGameId}`);
      }, 800); // Delay navigation to allow transition animation
      
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, transitionGameId, router]);
  
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
    setTotalPages(Math.ceil(initialRooms.length / ROOMS_PER_PAGE));
  };
  
  // Find game associated with a room
  const getGameForRoom = (room: Room): IGame | undefined => {
    if (!room.gameId) return undefined;
    return games.find(game => game._id === room.gameId);
  };
  
  // Handle clicking on a room
  const handleRoomClick = (room: Room) => {
    if (!room.isLocked) {
      const game = getGameForRoom(room);
      
      if (game && game._id) {
        // Show room details first, then trigger transition
        setSelectedRoom(room);
        setSelectedGame(game);
        
        // Start transition to game page after a short delay
        setTimeout(() => {
          setIsTransitioning(true);
          setTransitionGameId(game._id);
          // Close modal after starting transition
          setTimeout(() => {
            setSelectedRoom(null);
            setSelectedGame(null);
          }, 400);
        }, 1000); // Reduced from 1500ms to 1000ms for a more responsive feel
      } else {
        // If no game, just show room details
        setSelectedRoom(room);
        setSelectedGame(null);
      }
    }
  };
  
  // Navigate directly to a game's detail page (used for "Enter Room" button)
  const navigateToGame = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    
    // Apply page transition animation
    document.body.classList.add('page-transitioning');
    setIsTransitioning(true);
    setTransitionGameId(gameId);
  };
  
  // Close the detail modal
  const closeDetail = () => {
    setSelectedRoom(null);
    setSelectedGame(null);
    setIsTransitioning(false);
    setTransitionGameId(null);
  };
  
  // Toggle info tip
  const toggleInfoTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfoTip(!showInfoTip);
  };
  
  // Toggle background style
  const toggleBackgroundStyle = () => {
    setBackgroundStyle(prev => prev === 'gradient' ? 'parallax' : 'gradient');
  };
  
  // Cycle through background themes
  const cycleBackgroundTheme = () => {
    const themes: ('default' | 'cool' | 'warm' | 'neutral')[] = ['default', 'cool', 'warm', 'neutral'];
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
  
  // Pagination functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Toggle render mode (for development/testing only)
  const toggleRenderMode = () => {
    if (renderMode === 'static') {
      setRenderMode('2d-animated');
      setAnimationConfig({
        ...animationConfig,
        enabled: true
      });
    } else if (renderMode === '2d-animated') {
      setRenderMode('webgl');
    } else {
      setRenderMode('static');
      setAnimationConfig({
        ...animationConfig,
        enabled: false
      });
    }
  };
  
  // Get main container classes based on transition state
  const getMainContainerClasses = () => {
    const baseClasses = "journal-page p-8 rounded-2xl relative z-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md";
    
    if (isTransitioning) {
      return `${baseClasses} animate-pageOut`;
    }
    
    return `${baseClasses} animate-pageIn`;
  };
  
  // Main renderer
  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-5xl relative">
          <div className="journal-page p-8 rounded-2xl relative z-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
            <h1 className="journal-title text-center">Mind Palace (Prototype)</h1>
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-accent rounded-full border-t-transparent animate-spin"></div>
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
        {/* Animated Background */}
        <AnimatedBackground 
          style={backgroundStyle} 
          theme={backgroundTheme}
          intensity={backgroundIntensity}
        />
        
        <div className={getMainContainerClasses()}>
          {/* Header - modular component */}
          <MindPalaceHeader 
            renderMode={renderMode}
            animationConfig={animationConfig}
          />
          
          {/* Development render mode toggle - can be removed in production */}
          <div className="mb-4 text-right flex justify-end items-center gap-4">
            <button 
              onClick={toggleBackgroundStyle} 
              className="text-xs text-gray-500 hover:text-accent"
            >
              Background: {backgroundStyle}
            </button>
            <button 
              onClick={cycleBackgroundTheme} 
              className="text-xs text-gray-500 hover:text-accent"
            >
              Theme: {backgroundTheme}
            </button>
            <button 
              onClick={cycleBackgroundIntensity} 
              className="text-xs text-gray-500 hover:text-accent"
            >
              Intensity: {backgroundIntensity}
            </button>
            <button 
              onClick={toggleRenderMode} 
              className="text-xs text-gray-500 hover:text-accent"
            >
              Mode: {renderMode}
            </button>
          </div>
          
          {/* Introduction - modular component */}
          <MindPalaceIntro 
            showInfoTip={showInfoTip} 
            toggleInfoTip={toggleInfoTip}
            renderMode={renderMode}
            animationConfig={animationConfig}
          />
          
          {/* Keyboard Helper Component */}
          <div className="relative mb-6">
            <KeyboardHelper showInitially={false} />
          </div>
          
          {/* Grid Layout for Rooms - modular component */}
          <RoomGrid 
            rooms={displayedRooms}
            getGameForRoom={getGameForRoom}
            handleRoomClick={handleRoomClick}
            navigateToGame={navigateToGame}
            renderMode={renderMode}
            animationConfig={animationConfig}
          />
          
          {/* Pagination Controls - modular component */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              goToPrevPage={goToPrevPage}
              goToNextPage={goToNextPage}
              renderMode={renderMode}
              animationConfig={animationConfig}
            />
          )}
          
          {/* Room Detail Modal - modular component */}
          {selectedRoom && (
            <RoomDetailModal 
              room={selectedRoom}
              game={selectedGame}
              isTransitioning={isTransitioning}
              onClose={closeDetail}
              onEnterRoom={(e) => {
                e.stopPropagation();
                if (selectedGame && selectedGame._id) {
                  setIsTransitioning(true);
                  setTransitionGameId(selectedGame._id);
                }
              }}
              renderMode={renderMode}
              animationConfig={animationConfig}
            />
          )}
        </div>
      </main>
    </>
  );
} 