import { z } from 'zod';

// Game status validation
export const gameStatusEnum = z.enum([
  'Playing',
  'Completed',
  'On Hold',
  'Dropped',
  'Plan to Play',
]);

// Platform validation
export const gamePlatformEnum = z.enum([
  'PC',
  'Steam Deck',
  'PlayStation 5',
  'PlayStation 4',
  'PlayStation 3',
  'PS Vita',
  'Xbox Series X/S',
  'Xbox One',
  'Xbox 360',
  'Nintendo Switch',
  'Nintendo 3DS',
  'Wii U',
  'MacOS',
  'Linux',
  'iOS',
  'Android',
  'Retro',
  'Other',
]);

// Game schema validation for creation
export const gameCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  platform: gamePlatformEnum,
  status: gameStatusEnum.default('Plan to Play'),
  rating: z.number().min(0).max(10).default(0),
  hoursPlayed: z.number().min(0).default(0),
  imageUrl: z.string().url().optional().nullable(),
  notes: z.string().max(2000, 'Notes are too long').optional().nullable(),
  composer: z.string().max(200, 'Composer name is too long').optional().nullable(),
  genres: z.array(z.string()).optional().default([]),
  isFavorite: z.boolean().optional().default(false),
});

// Game schema validation for updates
export const gameUpdateSchema = gameCreateSchema.partial();

// Game search validation
export const gameSearchSchema = z.object({
  search: z.string().optional(),
  status: gameStatusEnum.optional(),
  platform: z.string().optional(),
  sort: z.enum(['title', 'rating', 'status', 'platform', 'hoursPlayed', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(500).optional(),
  page: z.number().min(1).optional(),
});

// Game ID validation
export const gameIdSchema = z.object({
  id: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: 'Invalid MongoDB ObjectId format',
  }),
});

// Types derived from the schemas
export type GameStatus = z.infer<typeof gameStatusEnum>;
export type GamePlatform = z.infer<typeof gamePlatformEnum>;
export type GameCreate = z.infer<typeof gameCreateSchema>;
export type GameUpdate = z.infer<typeof gameUpdateSchema>;
export type GameSearch = z.infer<typeof gameSearchSchema>;
export type GameId = z.infer<typeof gameIdSchema>;

// Helper function to validate MongoDB ObjectId
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
