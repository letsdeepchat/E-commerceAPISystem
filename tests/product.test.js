import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import productRoutes from '../routes/product.routes.js';
import userRoutes from '../routes/user.routes.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import Category from '../models/category.model.js';
import { startMemoryServer } from './test-utils.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

let adminToken;
let userToken;
let productId;
let mongoServer;

beforeAll(async () => {
  mongoServer = await startMemoryServer();
  const mongoUri = mongoServer.uri;
  await mongoose.connect(mongoUri);
  process.env.JWT_SECRET = 'testsecret';
  process.env.JWT_EXPIRES_IN = '1h';

  // Create admin and user for testing
  await User.deleteMany({});
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);
  
  const admin = new User({ name: 'Admin', email: 'admin@test.com', password: hashedPassword, role: 'admin' });
  await admin.save();

  const user = new User({ name: 'User', email: 'user@test.com', password: hashedPassword });
  await user.save();

  // Login as admin and user to get tokens
  const adminLogin = await request(app).post('/api/users/login').send({ email: 'admin@test.com', password: 'password' });
  adminToken = adminLogin.body.token;

  const userLogin = await request(app).post('/api/users/login').send({ email: 'user@test.com', password: 'password' });
  userToken = userLogin.body.token;
});

afterAll(async () => {
  await Product.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Product API', () => {
  it('should create a new product as an admin', async () => {
    const category = new Category({ name: 'Test Category' });
    await category.save();

    const res = await request(app)
      .post('/api/products')
      .set('x-auth-token', adminToken)
      .send({ name: 'Test Product', price: 100, description: 'Test description', category: category._id, stock: 10 });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Test Product');
    productId = res.body._id;
  });

  it('should not create a new product as a regular user', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('x-auth-token', userToken)
      .send({ name: 'Another Product', price: 200, description: 'Another description' });
    expect(res.statusCode).toEqual(403);
  });

  it('should get all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a single product', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Test Product');
  });

  it('should update a product as an admin', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('x-auth-token', adminToken)
      .send({ price: 150 });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('price', 150);
  });

  it('should delete a product as an admin', async () => {
    const res = await request(app).delete(`/api/products/${productId}`).set('x-auth-token', adminToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('msg', 'Product removed');
  });
});
