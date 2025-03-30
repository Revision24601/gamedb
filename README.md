# gamedb
Game DB
=======
# GameDB

GameDB is a personal game tracking application that allows you to maintain a database of your video games collection. Keep track of games you've played, are currently playing, or want to play in the future.

## Features

- **Game Tracking**: Add games to your collection with detailed information including title, developer, publisher, release date, and more.
- **10-Star Rating System**: Rate your games on a scale from 1 to 10 stars.
- **Status Tracking**: Categorize games as Wishlist, In Library, Playing, Paused, Dropped, or Completed.
- **Search Functionality**: Quickly find games in your collection with the search feature.
- **Responsive Design**: Works on desktop and mobile devices.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **UI Components**: Headless UI, React Icons
- **Form Handling**: React Hook Form

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gamedb.git
   cd gamedb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/gamedb
   ```
   Or use MongoDB Atlas:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/gamedb?retryWrites=true&w=majority
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Adding a Game

1. Click on "Add Game" in the navigation bar.
2. Fill out the game details form.
3. Click "Save Game" to add it to your collection.

### Updating Game Status or Rating

1. Navigate to a game's detail page.
2. Use the status selector to update the game's status.
3. Use the star rating component to update your rating.

### Searching for Games

Use the search bar in the header to find games in your collection. The search will match against game titles.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [React Icons](https://react-icons.github.io/react-icons/) 
