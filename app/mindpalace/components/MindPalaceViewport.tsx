import React, { useState, useRef, useEffect } from 'react';
import { Room } from '../types';
import { IGame } from '@/models/Game';
import RoomCard from './RoomCard';
import DreamyBackground from './DreamyBackground';
import EntranceEffect from './EntranceEffect';

interface MindPalaceViewportProps {
  rooms: Room[];
  getGameForRoom: (room: Room) => IGame | undefined;
  handleRoomClick?: (room: Room) => void;
  navigateToGame?: (e: React.MouseEvent, gameId: string) => void;
}

// Status mapping to standardize game statuses into clusters
const getStatusCluster = (status?: string): string => {
  if (!status) return 'Other';
  
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus.includes('playing') || normalizedStatus.includes('current')) {
    return 'Currently Playing';
  } else if (normalizedStatus.includes('complete') || normalizedStatus.includes('finished')) {
    return 'Completed';
  } else if (normalizedStatus.includes('plan') || normalizedStatus.includes('backlog') || normalizedStatus.includes('on hold')) {
    return 'Backlog';
  } else if (normalizedStatus.includes('wish') || normalizedStatus.includes('want')) {
    return 'Wishlist';
  }
  
  return 'Other';
};

// Define colors for clusters
const getClusterColor = (cluster: string): string => {
  switch (cluster) {
    case 'Currently Playing': return 'from-blue-500/20 to-blue-700/20 border-blue-500/30';
    case 'Completed': return 'from-green-500/20 to-green-700/20 border-green-500/30';
    case 'Backlog': return 'from-purple-500/20 to-purple-700/20 border-purple-500/30';
    case 'Wishlist': return 'from-amber-500/20 to-amber-700/20 border-amber-500/30';
    default: return 'from-gray-500/20 to-gray-700/20 border-gray-500/30';
  }
};

const MindPalaceViewport: React.FC<MindPalaceViewportProps> = ({
  rooms,
  getGameForRoom,
  handleRoomClick = () => {},
  navigateToGame = () => {},
}) => {
  // State for panning and viewport
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [targetTranslateX, setTargetTranslateX] = useState(0);
  const [targetTranslateY, setTargetTranslateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [targetScale, setTargetScale] = useState(1);
  
  // State for room focus
  const [focusedRoom, setFocusedRoom] = useState<Room | null>(null);
  const [focusedRoomPosition, setFocusedRoomPosition] = useState<{x: number, y: number} | null>(null);
  const [isZoomingToRoom, setIsZoomingToRoom] = useState(false);
  
  const animationRef = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Group rooms by their status clusters
  const roomsByCluster: Record<string, { rooms: Room[], games: (IGame | undefined)[] }> = {};
  
  // Organize rooms into clusters
  rooms.forEach(room => {
    const game = getGameForRoom(room);
    const clusterName = getStatusCluster(game?.status);
    
    if (!roomsByCluster[clusterName]) {
      roomsByCluster[clusterName] = { rooms: [], games: [] };
    }
    
    roomsByCluster[clusterName].rooms.push(room);
    roomsByCluster[clusterName].games.push(game);
  });
  
  // Define cluster positions
  const getClusterPosition = (clusterIndex: number) => {
    const clusterSpacing = 800; // Space between clusters
    const gridSize = 2; // 2x2 grid of clusters
    const row = Math.floor(clusterIndex / gridSize);
    const col = clusterIndex % gridSize;
    
    return {
      x: col * clusterSpacing,
      y: row * clusterSpacing
    };
  };
  
  // Calculate room positions within a cluster
  const getRoomPosition = (clusterPosition: { x: number, y: number }, roomIndex: number, totalRoomsInCluster: number) => {
    // Arrange rooms in a circular pattern around the cluster center
    const radius = 250; // Radius of the circle
    const angleIncrement = (2 * Math.PI) / totalRoomsInCluster;
    const angle = roomIndex * angleIncrement;
    
    // For smaller clusters, reduce the radius
    const adjustedRadius = Math.min(radius, 100 + (totalRoomsInCluster * 20));
    
    // Calculate x, y position on the circle
    const x = clusterPosition.x + Math.cos(angle) * adjustedRadius;
    const y = clusterPosition.y + Math.sin(angle) * adjustedRadius;
    
    return { x, y };
  };
  
  // Smooth animation function for panning and zooming
  const animateViewport = () => {
    const easeThreshold = 0.5; // Minimum distance to stop animation (prevents tiny movements)
    
    if (Math.abs(targetTranslateX - translateX) > easeThreshold || 
        Math.abs(targetTranslateY - translateY) > easeThreshold || 
        Math.abs(targetScale - scale) > 0.01) {
      
      // Calculate step for smooth animation with damping
      const translateXStep = (targetTranslateX - translateX) * 0.1; // Increased from 0.08 to 0.1
      const translateYStep = (targetTranslateY - translateY) * 0.1;
      const scaleStep = (targetScale - scale) * 0.1;
      
      // Apply the step
      setTranslateX(prev => {
        // If very close to target, snap to it
        if (Math.abs(targetTranslateX - prev) < easeThreshold) return targetTranslateX;
        return prev + translateXStep;
      });
      
      setTranslateY(prev => {
        if (Math.abs(targetTranslateY - prev) < easeThreshold) return targetTranslateY;
        return prev + translateYStep;
      });
      
      setScale(prev => {
        if (Math.abs(targetScale - prev) < 0.01) return targetScale;
        return prev + scaleStep;
      });
      
      // Request next animation frame
      animationRef.current = requestAnimationFrame(animateViewport);
    } else {
      // We've reached the target, ensure exact values
      setTranslateX(targetTranslateX);
      setTranslateY(targetTranslateY);
      setScale(targetScale);
      
      // Handle room focus completion
      if (isZoomingToRoom && focusedRoom) {
        setTimeout(() => {
          handleRoomClick(focusedRoom);
          setIsZoomingToRoom(false);
        }, 300);
      }
    }
  };
  
  // Start animation when target values change
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animateViewport);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetTranslateX, targetTranslateY, targetScale, isZoomingToRoom]);
  
  // Handle mouse/touch down event to start dragging
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isZoomingToRoom || focusedRoom || !isMouseOverViewport) return; // Prevent dragging if not focused on viewport
    
    if (e.target !== viewportRef.current && e.target !== canvasRef.current) {
      const target = e.target as HTMLElement;
      // Allow dragging if clicking on the cluster label or background
      if (!target.closest('.room-card') && !target.closest('.control-button')) {
        e.preventDefault();
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        setIsDragging(true);
        setStartX(clientX - translateX);
        setStartY(clientY - translateY);
      }
      return;
    }
    
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    setStartX(clientX - translateX);
    setStartY(clientY - translateY);
  };
  
  // Handle mouse/touch move event to update position
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || isZoomingToRoom || focusedRoom) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const newTranslateX = clientX - startX;
    const newTranslateY = clientY - startY;
    
    setTargetTranslateX(newTranslateX);
    setTargetTranslateY(newTranslateY);
  };
  
  // Handle mouse/touch up event to stop dragging
  const handleMouseUp = () => {
    // When stopping drag, set target position to current position to prevent continued movement
    if (isDragging) {
      setTargetTranslateX(translateX);
      setTargetTranslateY(translateY);
    }
    setIsDragging(false);
  };
  
  // State to track if mouse is over the viewport
  const [isMouseOverViewport, setIsMouseOverViewport] = useState(false);
  
  // Handle wheel event for zooming - only when mouse is over viewport
  const handleWheel = (e: React.WheelEvent) => {
    if (isZoomingToRoom || focusedRoom || !isMouseOverViewport) return;
    
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(2, scale + delta));
    
    setTargetScale(newScale);
  };
  
  // Center on a specific cluster with smooth animation
  const centerOnCluster = (clusterIndex: number) => {
    if (!viewportRef.current || isZoomingToRoom || (!isMouseOverViewport && !focusedRoom)) return;
    
    // If there's a focused room, unfocus it first
    if (focusedRoom) {
      setFocusedRoom(null);
      setFocusedRoomPosition(null);
    }
    
    const { x, y } = getClusterPosition(clusterIndex);
    const viewportWidth = viewportRef.current.clientWidth;
    const viewportHeight = viewportRef.current.clientHeight;
    
    setTargetTranslateX((viewportWidth / 2) - (x * targetScale));
    setTargetTranslateY((viewportHeight / 2) - (y * targetScale));
  };
  
  // Function to focus on a specific room
  const focusOnRoom = (room: Room, position: {x: number, y: number}) => {
    if (!viewportRef.current || isZoomingToRoom) return;
    
    const viewportWidth = viewportRef.current.clientWidth;
    const viewportHeight = viewportRef.current.clientHeight;
    
    setIsZoomingToRoom(true);
    setFocusedRoom(room);
    setFocusedRoomPosition(position);
    
    // Calculate target position to center the room
    const targetX = (viewportWidth / 2) - (position.x * 1.5); // 1.5 is the target zoom level
    const targetY = (viewportHeight / 2) - (position.y * 1.5);
    
    // Set target values for smooth animation
    setTargetTranslateX(targetX);
    setTargetTranslateY(targetY);
    setTargetScale(1.5);
  };
  
  // Handle room click to focus or unfocus
  const onRoomCardClick = (room: Room, position: {x: number, y: number}) => {
    if (focusedRoom && focusedRoom.id === room.id) {
      // If clicking the already focused room, trigger the actual navigation
      const game = getGameForRoom(room);
      if (game && game._id) {
        // Create a synthetic event for the navigateToGame function
        const syntheticEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
        } as React.MouseEvent;
        
        navigateToGame(syntheticEvent, game._id);
      }
    } else {
      // Focus on the clicked room
      focusOnRoom(room, position);
    }
  };
  
  // Exit focus mode
  const exitFocusMode = () => {
    setFocusedRoom(null);
    setFocusedRoomPosition(null);
    setTargetScale(1);
    
    // Find which cluster the focused room was in and center on it
    if (focusedRoom) {
      const game = getGameForRoom(focusedRoom);
      const clusterName = getStatusCluster(game?.status);
      const clusterIndex = Object.keys(roomsByCluster).indexOf(clusterName);
      if (clusterIndex >= 0) {
        centerOnCluster(clusterIndex);
      }
    }
  };
  
  // Set up event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, startX, startY, isZoomingToRoom, focusedRoom]);
  
  // Handle keyboard events for exiting focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (focusedRoom || isZoomingToRoom)) {
        exitFocusMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedRoom, isZoomingToRoom]);
  
  // State for entrance animation
  const [showEntranceEffect, setShowEntranceEffect] = useState(true);
  const [entranceComplete, setEntranceComplete] = useState(false);
  
  // Center viewport initially and handle entrance animation
  useEffect(() => {
    if (viewportRef.current && canvasRef.current) {
      // Set initial scale for entrance animation
      if (!entranceComplete) {
        setScale(0.3); // Start with a smaller scale
        setTargetScale(1); // Target the normal scale
      }
      
      // Initial centering - center on "Currently Playing" if it exists,
      // otherwise center on the first available cluster
      if (roomsByCluster['Currently Playing']) {
        centerOnCluster(Object.keys(roomsByCluster).indexOf('Currently Playing'));
      } else if (Object.keys(roomsByCluster).length > 0) {
        centerOnCluster(0);
      }
    }
  }, [rooms, entranceComplete]);

  // Handle entrance animation completion
  const handleEntranceComplete = () => {
    setEntranceComplete(true);
    setShowEntranceEffect(false);
  };
  
  // Track mouse enter/leave on viewport
  const handleMouseEnter = () => {
    setIsMouseOverViewport(true);
  };
  
  const handleMouseLeave = () => {
    setIsMouseOverViewport(false);
    // Stop dragging and prevent continued movement when mouse leaves viewport
    if (isDragging) {
      setTargetTranslateX(translateX);
      setTargetTranslateY(translateY);
      setIsDragging(false);
    }
  };
  
  // Set up global wheel event prevention
  useEffect(() => {
    // Function to handle wheel events at document level
    const preventDefaultWheel = (e: WheelEvent) => {
      // Only prevent default if mouse is over viewport
      if (isMouseOverViewport) {
        e.preventDefault();
      }
    };
    
    // Add passive wheel event listener to document
    // The {passive: false} option is necessary to allow preventDefault
    document.addEventListener('wheel', preventDefaultWheel, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', preventDefaultWheel);
    };
  }, [isMouseOverViewport]);
  
  // Button handlers for zoom controls - update to check for mouse focus
  const handleZoomIn = () => {
    if (!isMouseOverViewport && !focusedRoom) return;
    setTargetScale(Math.min(2, scale + 0.1));
  };
  
  const handleZoomOut = () => {
    if (!isMouseOverViewport && !focusedRoom) return;
    setTargetScale(Math.max(0.5, scale - 0.1));
  };
  
  const handleReset = () => {
    if (!isMouseOverViewport && !focusedRoom) return;
    const firstClusterIndex = Object.keys(roomsByCluster).indexOf('Currently Playing') >= 0 
      ? Object.keys(roomsByCluster).indexOf('Currently Playing')
      : 0;
    centerOnCluster(firstClusterIndex);
    setTargetScale(1);
  };
  
  // Handle keyboard events for navigation
  useEffect(() => {
    // Track which keys are currently pressed
    const keysPressed = new Set<string>();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation when viewport is active and not in focus mode
      if (!isMouseOverViewport && !focusedRoom) return;
      
      // Skip if in focus mode or during room zoom animation
      if (isZoomingToRoom || focusedRoom) {
        // Only handle Escape key in focus mode
        if (e.key === 'Escape') {
          exitFocusMode();
        }
        return;
      }
      
      // Skip if inputs are focused (like text inputs)
      if (document.activeElement instanceof HTMLInputElement || 
          document.activeElement instanceof HTMLTextAreaElement) {
        return;
      }

      // Add key to pressed keys set
      keysPressed.add(e.key);
      
      // Navigation speed - adjust based on current zoom level
      const moveSpeed = 100 / scale;
      
      // Handle immediate actions that don't need continuous movement
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'Home':
          e.preventDefault();
          handleReset();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault(); // Prevent page scrolling
          break;
      }
    };
    
    // Handle key release to stop movement
    const handleKeyUp = (e: KeyboardEvent) => {
      // Remove key from pressed keys set
      keysPressed.delete(e.key);
      
      // If it was an arrow key, update target immediately to match current position
      // This ensures immediate stopping when keys are released
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // If no other arrow keys are pressed, immediately stop movement
        const hasOtherArrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].some(key => 
          key !== e.key && keysPressed.has(key)
        );
        
        if (!hasOtherArrowKeys) {
          setTargetTranslateX(translateX);
          setTargetTranslateY(translateY);
        }
      }
    };
    
    // Create a function that processes the current state of pressed keys
    // to move the viewport at a consistent rate
    const processKeys = () => {
      if (!isMouseOverViewport && !focusedRoom) return;
      if (isZoomingToRoom || focusedRoom) return;
      
      // Check if any arrow keys are pressed
      const isArrowKeyPressed = keysPressed.has('ArrowUp') || 
                               keysPressed.has('ArrowDown') || 
                               keysPressed.has('ArrowLeft') || 
                               keysPressed.has('ArrowRight');
      
      // If no arrow keys are pressed, make sure the target position matches the current position
      // This ensures the viewport stops moving when keys are released
      if (!isArrowKeyPressed) {
        setTargetTranslateX(translateX);
        setTargetTranslateY(translateY);
        return;
      }
      
      // Only apply movement if relevant keys are pressed
      const moveSpeed = 15 / scale; // Reduced speed for smoother movement
      
      if (keysPressed.has('ArrowUp')) {
        setTargetTranslateY(prev => prev + moveSpeed);
      }
      if (keysPressed.has('ArrowDown')) {
        setTargetTranslateY(prev => prev - moveSpeed);
      }
      if (keysPressed.has('ArrowLeft')) {
        setTargetTranslateX(prev => prev + moveSpeed);
      }
      if (keysPressed.has('ArrowRight')) {
        setTargetTranslateX(prev => prev - moveSpeed);
      }
    };
    
    // Set up an animation frame loop to process keys at a consistent rate
    let animationFrameId: number;
    
    const keyAnimationLoop = () => {
      processKeys();
      animationFrameId = requestAnimationFrame(keyAnimationLoop);
    };
    
    // Start the animation loop
    keyAnimationLoop();
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Clean up listeners and animation frame when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
      keysPressed.clear();
    };
  }, [isMouseOverViewport, focusedRoom, isZoomingToRoom, scale]);
  
  // State for background theme
  const [bgTheme, setBgTheme] = useState<'default' | 'warm' | 'cool'>('default');
  const [bgDensity, setBgDensity] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Cycle through background themes
  const cycleBgTheme = () => {
    setBgTheme(theme => {
      if (theme === 'default') return 'warm';
      if (theme === 'warm') return 'cool';
      return 'default';
    });
  };
  
  // Cycle through background densities
  const cycleBgDensity = () => {
    setBgDensity(density => {
      if (density === 'low') return 'medium';
      if (density === 'medium') return 'high';
      return 'low';
    });
  };
  
  return (
    <div
      ref={viewportRef}
      className={`relative w-full h-[70vh] overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl 
        rpg-map-bg rpg-map-grid
        ${focusedRoom ? 'focused-mode' : ''} 
        ${isMouseOverViewport ? 'ring-2 ring-accent/30 ring-opacity-75' : ''}
        ${!entranceComplete ? 'animate-entrance-zoom' : 'animate-viewportFadeIn'}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onWheel={handleWheel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
    >
      {/* Entrance effect overlay - only show on first load */}
      {showEntranceEffect && (
        <EntranceEffect onComplete={handleEntranceComplete} />
      )}
      
      {/* Dreamy animated background layer */}
      <DreamyBackground theme={bgTheme} density={bgDensity} />
      
      {/* Small indicator when viewport is active */}
      {isMouseOverViewport && !focusedRoom && (
        <div className="absolute top-2 right-2 bg-amber-700/80 text-amber-50 text-xs px-2 py-1 rounded-full shadow-md animate-fadeIn rpg-button">
          Viewport active
        </div>
      )}
      
      {/* Background controls */}
      {isMouseOverViewport && !focusedRoom && (
        <div className="absolute top-2 left-2 flex space-x-2 z-20">
          <button 
            onClick={cycleBgTheme}
            className="px-2 py-1 bg-amber-50/80 dark:bg-amber-800/80 text-amber-800 dark:text-amber-100 text-xs rounded-full shadow-md rpg-button"
          >
            Theme: {bgTheme}
          </button>
          <button 
            onClick={cycleBgDensity}
            className="px-2 py-1 bg-amber-50/80 dark:bg-amber-800/80 text-amber-800 dark:text-amber-100 text-xs rounded-full shadow-md rpg-button"
          >
            Density: {bgDensity}
          </button>
        </div>
      )}
      
      {/* Overlay background when focused on a room */}
      {focusedRoom && (
        <div 
          className="absolute inset-0 z-10 bg-amber-900/30 backdrop-blur-sm animate-fadeIn"
          onClick={exitFocusMode}  
        />
      )}
      
      {/* Canvas where rooms are positioned */}
      <div
        ref={canvasRef}
        className="absolute transition-transform duration-100 cursor-move"
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transformOrigin: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        {/* Render each cluster */}
        {Object.entries(roomsByCluster).map(([clusterName, { rooms: clusterRooms, games }], clusterIndex) => {
          const clusterPosition = getClusterPosition(clusterIndex);
          const clusterColorClasses = getClusterColor(clusterName);
          
          return (
            <div 
              key={clusterName}
              className="absolute"
              style={{
                left: `${clusterPosition.x}px`,
                top: `${clusterPosition.y}px`,
                width: '600px',
                height: '600px',
              }}
            >
              {/* Cluster background */}
              <div 
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${clusterColorClasses} rpg-cluster
                  ${focusedRoom ? 'opacity-30' : ''}`}
                style={{ 
                  transform: 'scale(0.95)',
                  width: '100%',
                  height: '100%'
                }}
              />
              
              {/* Cluster title */}
              <div className="absolute top-8 left-0 right-0 text-center animate-cluster-title">
                <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100 drop-shadow-md px-4 py-2 rounded-lg 
                  inline-block bg-amber-50/90 dark:bg-amber-900/80 backdrop-blur-sm border border-amber-900/20 
                  dark:border-amber-100/20 rpg-cluster-title">
                  {clusterName}
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                  {clusterRooms.length} {clusterRooms.length === 1 ? 'room' : 'rooms'}
                </p>
              </div>
              
              {/* Rooms in this cluster */}
              {clusterRooms.map((room, roomIndex) => {
                const position = getRoomPosition(
                  clusterPosition, 
                  roomIndex, 
                  clusterRooms.length
                );
                const game = getGameForRoom(room);
                const isFocused = focusedRoom?.id === room.id;
                
                // Calculate entrance delay for staggered appearance
                const entranceDelay = !entranceComplete ? 
                  Math.min(1.5, 1.0 + (roomIndex * 0.05) + (clusterIndex * 0.1)) : 0;
                
                return (
                  <div
                    key={room.id}
                    className={`absolute transition-transform duration-300 hover:z-10 
                      ${roomIndex % 3 === 0 ? 'animate-floatingCard' : ''} 
                      ${isFocused ? 'z-20 scale-110 rpg-room-focused' : focusedRoom ? 'opacity-40' : ''} 
                      room-card rpg-room`}
                    style={{
                      left: `${position.x - clusterPosition.x}px`,
                      top: `${position.y - clusterPosition.y}px`,
                      width: '250px',
                      height: '250px',
                      animationDelay: `${roomIndex * 0.2}s`,
                      transform: 'translate(-50%, -50%)',
                      opacity: !entranceComplete ? 0 : 1,
                      transition: `transform 0.3s, opacity 0.5s ${entranceDelay}s`
                    }}
                    onClick={() => onRoomCardClick(room, position)}
                  >
                    <RoomCard
                      room={room}
                      game={game}
                      onClick={() => {}} // We handle the click at the container level
                      onEnterRoom={isFocused ? navigateToGame : () => {}}
                      renderMode="2d-animated"
                      animationConfig={{ enabled: true }}
                    />
                    
                    {/* Confirmation tooltip when focused */}
                    {isFocused && (
                      <div className="absolute -bottom-14 left-0 right-0 text-center">
                        <div className="inline-block bg-amber-50/90 dark:bg-amber-900/90 text-amber-800 dark:text-amber-100 
                          px-4 py-2 rounded-full shadow-lg text-sm animate-fadeIn rpg-button">
                          Click again to enter
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* Navigation controls - only show when not in focus mode */}
      {!focusedRoom && (
        <>
          <div className="absolute bottom-4 right-4 flex gap-2 rpg-controls p-2 rounded-full">
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 bg-amber-50 dark:bg-amber-800 rounded-full flex items-center justify-center 
                shadow-md hover:bg-amber-100 dark:hover:bg-amber-700 hover:text-amber-800 dark:hover:text-amber-100 
                transition-colors control-button rpg-button"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 bg-amber-50 dark:bg-amber-800 rounded-full flex items-center justify-center 
                shadow-md hover:bg-amber-100 dark:hover:bg-amber-700 hover:text-amber-800 dark:hover:text-amber-100 
                transition-colors control-button rpg-button"
              aria-label="Zoom out"
            >
              -
            </button>
            <button
              onClick={handleReset}
              className="w-10 h-10 bg-amber-50 dark:bg-amber-800 rounded-full flex items-center justify-center 
                shadow-md hover:bg-amber-100 dark:hover:bg-amber-700 hover:text-amber-800 dark:hover:text-amber-100 
                transition-colors animate-viewportControlPulse control-button rpg-button"
              aria-label="Reset view"
            >
              ↻
            </button>
          </div>
          
          {/* Cluster navigation */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-xs rpg-controls p-2 rounded-xl">
            {Object.keys(roomsByCluster).map((clusterName, index) => (
              <button
                key={clusterName}
                onClick={() => centerOnCluster(index)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full shadow-md transition-colors 
                  control-button rpg-button rpg-compass
                  bg-amber-50 dark:bg-amber-800 text-amber-900 dark:text-amber-100
                  hover:bg-amber-100 dark:hover:bg-amber-700`}
              >
                {clusterName}
              </button>
            ))}
          </div>
        </>
      )}
      
      {/* Back button when in focus mode */}
      {focusedRoom && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={exitFocusMode}
            className="px-4 py-2 bg-amber-50/90 dark:bg-amber-800/90 text-amber-900 dark:text-amber-100 
              rounded-full shadow-lg text-sm flex items-center gap-2 
              hover:bg-amber-100 dark:hover:bg-amber-700 transition-colors rpg-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to overview
          </button>
        </div>
      )}
      
      {/* Show empty state if no rooms */}
      {rooms.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-amber-800 dark:text-amber-200">
          <p className="text-lg mb-2">No rooms available</p>
          <p className="text-sm text-center">Your mind palace is still being constructed. Please add some games to your collection first.</p>
        </div>
      )}
      
      {/* Keyboard controls hint - show only when viewport is active but not focused */}
      {isMouseOverViewport && !focusedRoom && (
        <div className="absolute bottom-20 right-4 px-3 py-2 bg-amber-50/70 dark:bg-amber-800/70 rounded-lg text-amber-800 dark:text-amber-100 text-xs shadow-md animate-fadeIn">
          <div className="flex items-center gap-1 mb-1">
            <span className="px-1 border border-amber-700/30 rounded">←</span>
            <span className="px-1 border border-amber-700/30 rounded">→</span>
            <span className="px-1 border border-amber-700/30 rounded">↑</span>
            <span className="px-1 border border-amber-700/30 rounded">↓</span>
            <span className="ml-1">to navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1 border border-amber-700/30 rounded">+</span>
            <span className="px-1 border border-amber-700/30 rounded">-</span>
            <span className="ml-1">to zoom</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindPalaceViewport; 