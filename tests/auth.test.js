import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from '../routes/user.routes.js';
import User from '../models/user.model.js';
import { startMemoryServer } from './test-utils.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/users', authRoutes);

let testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`, // Unique email
  password: 'password123'
};

let mongoServer;

beforeAll(async () => {
  mongoServer = await startMemoryServer();
  const mongoUri = mongoServer.uri;
  await mongoose.connect(mongoUri);
  process.env.JWT_SECRET = 'testsecret';
  process.env.JWT_EXPIRES_IN = '1h';
}, 30000); // 30 second timeout for connection

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(() => {
  // Reset test user data before each test
  testUser.email = `test${Date.now()}@example.com`;
});

describe('Auth API', () => {
  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toEqual(testUser.email);
    });

    it('should not register user with existing email', async () => {
      // Register first time
      await request(app)
        .post('/api/users/register')
        .send(testUser);
      
      // Try registering again with same email
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(400);
    });

    it('should not register user without required fields', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User'
          // Missing email and password
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Register user before login tests
      await request(app)
        .post('/api/users/register')
        .send(testUser);
    });

    it('should login an existing user', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });
      
      expect(res.statusCode).toEqual(401);
    });

    it('should not login non-existent user', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/users/profile', () => {
    let token;

    beforeEach(async () => {
      // Register and login to get token
      await request(app)
        .post('/api/users/register')
        .send(testUser);
      
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      
      token = loginRes.body.token;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('x-auth-token', token);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', testUser.name);
      expect(res.body).toHaveProperty('email', testUser.email);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.statusCode).toEqual(401);
    });

    it('should not get profile with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('x-auth-token', 'invalidtoken');

      expect(res.statusCode).toEqual(401);
    });

    it('should not get profile with expired token', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.expired';
      
      const res = await request(app)
        .get('/api/users/profile')
        .set('x-auth-token', expiredToken);

      expect(res.statusCode).toEqual(401);
    });
  });
});
