# Now Playing Shelf Feature

## Overview
The Now Playing Shelf is a dedicated component for GameDB that showcases games currently marked with "Playing" status. It provides at-a-glance information about in-progress games, including estimated completion progress based on hours played. The feature is designed to be responsive, interactive, and visually appealing on both mobile and desktop devices.

## Components Implemented

### 1. NowPlayingShelf
A horizontal scrollable shelf displaying game cards for the home page.

**Features:**
- Displays games with "Playing" status in a scrollable horizontal layout
- Shows game title, platform, and hours played
- Includes progress bars based on hours played (estimated against 40 hours)
- Supports touch and mouse dragging for smooth scrolling on all devices
- Provides hover effects for better interactivity
- Links to individual game detail pages
- Has loading, error, and empty states for better UX
- Displays custom scrollbars that adapt to light/dark mode

### 2. NowPlayingDetail
A more detailed grid layout view for the dashboard page.

**Features:**
- Shows a grid of games with "Playing" status (responsive layout)
- Displays more detailed information including:
  - Game title and platform
  - Hours played
  - User rating
  - Last updated date
  - Completion progress bar
- Organized in a card-based layout that displays more information
- Links to individual game detail pages
- Has loading, error, and empty states for better UX

## Technical Implementation

### Data Handling
- Fetches only games with "Playing" status from the API
- Sorts games by recently updated for the shelf view
- Sorts games by hours played for the detailed view
- Calculates progress based on a standard 40-hour baseline for completion
- Handles empty states and loading states appropriately

### UI/UX Features
- Custom scrolling behavior with mouse/touch dragging
- Progress bars visualize completion percentage
- Hover effects enhance interactivity
- Title truncation for long game names
- Responsive layouts for different screen sizes
- Dark mode support across all elements

### Theme Integration
- Integrated with next-themes for system/user preference theme detection
- Custom scrollbar styles for both light and dark modes
- Consistent styling with the main GameDB theme

## Testing Implementation

Cypress tests verify:
- Correct filtering of games by "Playing" status
- Proper display of progress bars with accurate percentages
- Navigation to game details when clicking games
- Display of appropriate empty states when no games are being played
- Detailed information display in the dashboard view

## How to Use

### For Users
- Games automatically appear in the shelf when marked as "Playing"
- Progress automatically updates as hours are logged
- Click on any game to navigate to its details
- Use mouse drag or touch to scroll through many games
- "View All" takes you to the dashboard for a more detailed view

### For Developers
- Import `NowPlayingShelf` for a compact horizontal view
- Import `NowPlayingDetail` for a detailed grid view
- Both components handle their own data fetching and states
- Add custom game progress logic by modifying the `calculateProgress` function
- Customize shelf appearance by modifying the CSS

## Future Enhancements
- Add sorting options (newest, most played, alphabetical)
- Allow users to set custom total hours for each game for more accurate progress
- Implement game completion estimate based on platform/genre averages
- Add filtering capabilities within the shelf view
- Enable drag-and-drop reordering of games 