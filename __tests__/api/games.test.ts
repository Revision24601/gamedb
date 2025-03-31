import mongoose from 'mongoose';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import request from 'supertest';
import * as dbHandler from '../utils/db-handler';
import Game from '@/models/Game';
import { GET, POST } from '@/app/api/games/route';

// Setup/Teardown for database
beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

// Create a test server to handle API requests
const createTestServer = (handler: any) => {
  const server = createServer((req, res) => {
    return apiResolver(
      req,
      res,
      undefined,
      handler,
      {
        previewModeEncryptionKey: '',
        previewModeId: '',
        previewModeSigningKey: '',
      },
      false
    );
  });
  return server;
};

describe('Games API', () => {
  describe('GET /api/games', () => {
    test('should return empty array when no games exist', async () => {
      const testServer = createTestServer(GET);
      const response = await request(testServer).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('games');
      expect(response.body.games).toEqual([]);
    });

    test('should return games when they exist', async () => {
      // Insert a test game directly into the database
      await Game.create({
        title: 'Test Game',
        platform: 'Test Platform',
        status: 'Playing',
        rating: 8,
        hoursPlayed: 10,
      });

      const testServer = createTestServer(GET);
      const response = await request(testServer).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('games');
      expect(response.body.games.length).toBe(1);
      expect(response.body.games[0].title).toBe('Test Game');
    });

    test('should filter games by status', async () => {
      // Insert test games
      await Game.create({
        title: 'Test Game 1',
        platform: 'Test Platform',
        status: 'Playing',
      });
      
      await Game.create({
        title: 'Test Game 2',
        platform: 'Test Platform',
        status: 'Completed',
      });

      const testServer = createTestServer(GET);
      const response = await request(testServer).get('/?status=Playing');
      
      expect(response.status).toBe(200);
      expect(response.body.games.length).toBe(1);
      expect(response.body.games[0].title).toBe('Test Game 1');
    });
  });

  describe('POST /api/games', () => {
    test('should create a new game with valid data', async () => {
      const testServer = createTestServer(POST);
      const gameData = {
        title: 'New Game',
        platform: 'Test Platform',
        status: 'Playing',
        rating: 9,
        hoursPlayed: 5,
      };

      const response = await request(testServer)
        .post('/')
        .send(gameData)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe('New Game');
      
      // Verify the game was saved to the database
      const savedGame = await Game.findById(response.body._id);
      expect(savedGame).not.toBeNull();
      expect(savedGame!.title).toBe('New Game');
    });

    test('should return 400 for invalid game data', async () => {
      const testServer = createTestServer(POST);
      const invalidGameData = {
        // Missing required title field
        platform: 'Test Platform',
      };

      const response = await request(testServer)
        .post('/')
        .send(invalidGameData)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 