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
        }, 1500);
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
  
  // Main renderer
  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="journal-page p-8 rounded-2xl">
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
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className={`journal-page p-8 rounded-2xl transition-all duration-700 ${isTransitioning ? 'scale-110 opacity-0' : ''}`}>
          {/* Header - modular component */}
          <MindPalaceHeader 
            renderMode={renderMode}
            animationConfig={animationConfig}
          />
          
          {/* Development render mode toggle - can be removed in production */}
          <div className="mb-4 text-right">
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