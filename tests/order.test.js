import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import orderRoutes from '../routes/order.routes.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Cart from '../models/cart.model.js';
import Order from '../models/order.model.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

let adminToken;
let userToken;
let user;
let orderId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});

  const admin = new User({ name: 'Admin', email: 'admin@test.com', password: 'password', role: 'admin' });
  await admin.save();

  user = new User({ name: 'User', email: 'user@test.com', password: 'password' });
  await user.save();

  const adminLogin = await request(app).post('/api/users/login').send({ email: 'admin@test.com', password: 'password' });
  adminToken = adminLogin.body.token;

  const userLogin = await request(app).post('/api/users/login').send({ email: 'user@test.com', password: 'password' });
  userToken = userLogin.body.token;

  const product = new Product({ name: 'Test Product', price: 100, description: 'Test description' });
  await product.save();

  const cart = new Cart({ user: user._id, products: [{ product: product._id, quantity: 1 }] });
  await cart.save();
});

afterAll(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});
  await mongoose.connection.close();
});

describe('Order API', () => {
  it('should create a new order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('x-auth-token', userToken)
      .send({ shippingAddress: '123 Test St' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('shippingAddress', '123 Test St');
    orderId = res.body._id;
  });

  it('should get all orders as an admin', async () => {
    const res = await request(app).get('/api/orders').set('x-auth-token', adminToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a specific order as the user who owns it', async () => {
    const res = await request(app).get(`/api/orders/${orderId}`).set('x-auth-token', userToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toBe(orderId);
  });

  it('should get a specific order as an admin', async () => {
    const res = await request(app).get(`/api/orders/${orderId}`).set('x-auth-token', adminToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toBe(orderId);
  });

  it('should not get another user\'s order as a regular user', async () => {
    // Create another user and order
    const anotherUser = new User({ name: 'Another User', email: 'another@test.com', password: 'password' });
    await anotherUser.save();
    const anotherUserLogin = await request(app).post('/api/users/login').send({ email: 'another@test.com', password: 'password' });
    const anotherUserToken = anotherUserLogin.body.token;
    const anotherOrderRes = await request(app).post('/api/orders').set('x-auth-token', anotherUserToken).send({ shippingAddress: '456 Other St' });
    const anotherOrderId = anotherOrderRes.body._id;

    const res = await request(app).get(`/api/orders/${anotherOrderId}`).set('x-auth-token', userToken);
    expect(res.statusCode).toEqual(403);
  });

  it('should update the status of an order as an admin', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}`)
      .set('x-auth-token', adminToken)
      .send({ status: 'Shipped' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'Shipped');
  });
});
