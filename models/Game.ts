import mongoose, { Model } from 'mongoose';
import { GameStatus } from '@/lib/validators';

export interface IGame {
  title: string;
  platform: string;
  status: GameStatus;
  rating: number;
  hoursPlayed: number;
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  _id?: string;
}

const gameSchema = new mongoose.Schema<IGame>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a game title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    platform: {
      type: String,
      required: [true, 'Please provide a platform'],
      trim: true,
      maxlength: [100, 'Platform name cannot be more than 100 characters']
    },
    status: {
      type: String,
      required: [true, 'Please provide a status'],
      enum: ['Playing', 'Completed', 'On Hold', 'Dropped', 'Plan to Play'],
      default: 'Plan to Play',
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    hoursPlayed: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot be more than 2000 characters']
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

function getModel(): Model<IGame> {
  // Check if the model is already registered
  if (mongoose.models && mongoose.models.Game) {
    return mongoose.models.Game as Model<IGame>;
  }

  // If not, register the model
  try {
    return mongoose.model<IGame>('Game');
  } catch {
    return mongoose.model<IGame>('Game', gameSchema);
  }
}

// Create or retrieve the Game model
const Game = getModel();

export default Game; 