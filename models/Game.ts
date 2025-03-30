import mongoose, { Schema, Document } from 'mongoose';

export enum GameStatus {
  WISHLIST = 'Wishlist',
  IN_LIBRARY = 'In Library',
  PLAYING = 'Playing',
  PAUSED = 'Paused',
  DROPPED = 'Dropped',
  COMPLETED = 'Completed',
}

export interface IGame extends Document {
  title: string;
  coverImage?: string;
  description?: string;
  releaseDate?: Date;
  developer?: string;
  publisher?: string;
  genres?: string[];
  platforms?: string[];
  rating: number; // 1-10 star rating
  status: GameStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema: Schema = new Schema(
  {
    title: { type: String, required: true, index: true },
    coverImage: { type: String },
    description: { type: String },
    releaseDate: { type: Date },
    developer: { type: String },
    publisher: { type: String },
    genres: [{ type: String }],
    platforms: [{ type: String }],
    rating: { 
      type: Number, 
      min: 1, 
      max: 10, 
      default: 5 
    },
    status: { 
      type: String, 
      enum: Object.values(GameStatus),
      default: GameStatus.WISHLIST 
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Create a text index for searching
GameSchema.index({ title: 'text', developer: 'text', publisher: 'text' });

export default mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema); 