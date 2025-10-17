import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import categoryRoutes from '../routes/category.routes.js';
import Category from '../models/category.model.js';
import User from '../models/user.model.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/categories', categoryRoutes);

let adminToken;
let userToken;
let categoryId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Create admin and user for testing
  await User.deleteMany({});
  const admin = new User({ name: 'Admin', email: 'admin@test.com', password: 'password', role: 'admin' });
  await admin.save();

  const user = new User({ name: 'User', email: 'user@test.com', password: 'password' });
  await user.save();

  // Login as admin and user to get tokens
  const adminLogin = await request(app).post('/api/users/login').send({ email: 'admin@test.com', password: 'password' });
  adminToken = adminLogin.body.token;

  const userLogin = await request(app).post('/api/users/login').send({ email: 'user@test.com', password: 'password' });
  userToken = userLogin.body.token;
});

afterAll(async () => {
  await Category.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Category API', () => {
  it('should create a new category as an admin', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('x-auth-token', adminToken)
      .send({ name: 'Test Category' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Test Category');
    categoryId = res.body._id;
  });

  it('should not create a new category as a regular user', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('x-auth-token', userToken)
      .send({ name: 'Another Category' });
    expect(res.statusCode).toEqual(403);
  });

  it('should get all categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a single category', async () => {
    const res = await request(app).get(`/api/categories/${categoryId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Test Category');
  });

  it('should update a category as an admin', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('x-auth-token', adminToken)
      .send({ name: 'Updated Category' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated Category');
  });

  it('should delete a category as an admin', async () => {
    const res = await request(app).delete(`/api/categories/${categoryId}`).set('x-auth-token', adminToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Category removed');
  });
});
