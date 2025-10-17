import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productRoutes from '../routes/product.routes.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

let adminToken;
let userToken;
let productId;

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
  await Product.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Product API', () => {
  it('should create a new product as an admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('x-auth-token', adminToken)
      .send({ name: 'Test Product', price: 100, description: 'Test description' });
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
    expect(res.body).toHaveProperty('message', 'Product removed');
  });
});
