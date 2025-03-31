# GameDB Dashboard Feature

## Overview
The dashboard is a new feature in GameDB that provides players with visual insights into their gaming collection. It displays a responsive bar graph of games that are currently being played, along with key statistics about the user's gaming collection.

## Features Implemented

### 1. Responsive Bar Chart
- Shows the top 15 games with "Playing" status, sorted by hours played
- Automatically adapts between horizontal bars on mobile and vertical bars on desktop
- Includes tooltips showing the full game title and hours played
- Bar heights/lengths represent hours played
- Interactive - clicking on a bar navigates to the game's detail page
- Truncates long game titles based on screen size to ensure readability

### 2. Collection Statistics
- Total games in the collection
- Number of completed games
- Average rating across all games
- Total hours spent on currently playing games
- Most played platform with count of games

### 3. Tabular Game List
- Alternative view in table format for better data readability on mobile
- Shows game title, platform, and hours played
- Linked titles for easy navigation to game details

### 4. Friendly Empty State
- Displayed when no games have "Playing" status
- Clear messaging encouraging users to add their first game
- Direct link to add a new game

### 5. Adaptive Layout
- Fully responsive design that works on all screen sizes
- Adjusts chart orientation based on screen width
- Adapts card layout from grid to stack on smaller screens

## Technical Implementation

### Libraries Used
- **Recharts**: For data visualization (bar chart)
- **React Hooks**: For state management and responsive design
- **TailwindCSS**: For styling and responsive layout

### Data Flow
1. Fetches all games for overall statistics
2. Calculates derived statistics (total games, completed games, average rating, etc.)
3. Separately fetches games with "Playing" status for the chart
4. Sorts and limits playing games to top 15 by hours played
5. Transforms game data into chart-compatible format
6. Adds interactivity through event handlers

### Testing
- Cypress end-to-end tests verify:
  - Dashboard displays correct statistics
  - Chart shows only games with "Playing" status
  - Chart bars are interactive and navigate to game details
  - Empty state displays correctly when no games are being played

## Future Enhancements
- Add filtering options for the chart (by platform, rating, etc.)
- Include trend data (games played over time)
- Add completion percentage for games in progress
- Implement genre distribution visualization 