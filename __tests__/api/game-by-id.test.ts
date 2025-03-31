import mongoose from 'mongoose';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import request from 'supertest';
import * as dbHandler from '../utils/db-handler';
import Game from '@/models/Game';
import { GET, PUT, DELETE } from '@/app/api/games/[id]/route';

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
      false,
      undefined
    );
  });
  return server;
};

describe('Game by ID API', () => {
  let testGameId: string;

  beforeEach(async () => {
    // Create a test game for each test
    const game = await Game.create({
      title: 'Test Game',
      platform: 'Test Platform',
      status: 'Playing',
      rating: 8,
      hoursPlayed: 10,
    });
    testGameId = game._id.toString();
  });

  describe('GET /api/games/[id]', () => {
    test('should return a game by ID', async () => {
      const testServer = createTestServer((req: any, res: any) => GET(req, { params: { id: testGameId } }));
      const response = await request(testServer).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testGameId);
      expect(response.body.title).toBe('Test Game');
    });

    test('should return 404 for non-existent game', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const testServer = createTestServer((req: any, res: any) => GET(req, { params: { id: nonExistentId } }));
      const response = await request(testServer).get('/');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for invalid ID format', async () => {
      const invalidId = 'invalid-id';
      const testServer = createTestServer((req: any, res: any) => GET(req, { params: { id: invalidId } }));
      const response = await request(testServer).get('/');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/games/[id]', () => {
    test('should update a game with valid data', async () => {
      const testServer = createTestServer((req: any, res: any) => PUT(req, { params: { id: testGameId } }));
      const updateData = {
        title: 'Updated Game',
        status: 'Completed',
        rating: 10,
      };

      const response = await request(testServer)
        .put('/')
        .send(updateData)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Game');
      expect(response.body.status).toBe('Completed');
      expect(response.body.rating).toBe(10);
      
      // Verify the database was updated
      const updatedGame = await Game.findById(testGameId);
      expect(updatedGame!.title).toBe('Updated Game');
    });

    test('should return 404 for non-existent game', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const testServer = createTestServer((req: any, res: any) => PUT(req, { params: { id: nonExistentId } }));
      const updateData = { title: 'Updated Game' };

      const response = await request(testServer)
        .put('/')
        .send(updateData)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/games/[id]', () => {
    test('should delete a game by ID', async () => {
      const testServer = createTestServer((req: any, res: any) => DELETE(req, { params: { id: testGameId } }));
      const response = await request(testServer).delete('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Game deleted successfully');
      
      // Verify the game was deleted from the database
      const deletedGame = await Game.findById(testGameId);
      expect(deletedGame).toBeNull();
    });

    test('should return 404 for non-existent game', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const testServer = createTestServer((req: any, res: any) => DELETE(req, { params: { id: nonExistentId } }));
      const response = await request(testServer).delete('/');
      
      expect(response.status).toBe(404);
    });
  });
}); 