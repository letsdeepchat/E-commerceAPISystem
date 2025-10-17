import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import cartRoutes from '../routes/cart.routes.js';
import userRoutes from '../routes/user.routes.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Cart from '../models/cart.model.js';
import Category from '../models/category.model.js';
import { startMemoryServer } from './test-utils.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);

let userToken;
let productId;
let mongoServer;

beforeAll(async () => {
  mongoServer = await startMemoryServer();
  const mongoUri = mongoServer.uri;
  await mongoose.connect(mongoUri);
  process.env.JWT_SECRET = 'testsecret';
  process.env.JWT_EXPIRES_IN = '1h';

  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});

  const category = new Category({ name: 'Test Category' });
  await category.save();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);

  const user = new User({ name: 'User', email: 'user@test.com', password: hashedPassword });
  await user.save();

  const userLogin = await request(app).post('/api/users/login').send({ email: 'user@test.com', password: 'password' });
  userToken = userLogin.body.token;

  const product = new Product({ name: 'Test Product', price: 100, description: 'Test description', category: category._id, stock: 10 });
  await product.save();
  productId = product._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Cart API', () => {
  it('should add a product to the cart', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('x-auth-token', userToken)
      .send({ productId, quantity: 1 });
    expect(res.statusCode).toEqual(201);
    expect(res.body.items[0].product).toBe(productId.toString());
  });

  it('should get the user cart', async () => {
    const res = await request(app).get('/api/cart').set('x-auth-token', userToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('items');
  });

  it('should update the quantity of a product in the cart', async () => {
    const res = await request(app)
      .put(`/api/cart/${productId}`)
      .set('x-auth-token', userToken)
      .send({ quantity: 2 });
    expect(res.statusCode).toEqual(200);
    expect(res.body.items[0].quantity).toBe(2);
  });

  it('should remove a product from the cart', async () => {
    const res = await request(app).delete(`/api/cart/${productId}`).set('x-auth-token', userToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body.items.length).toBe(0);
  });
});
