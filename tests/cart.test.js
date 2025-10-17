import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cartRoutes from '../routes/cart.routes.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Cart from '../models/cart.model.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/cart', cartRoutes);

let userToken;
let productId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});

  const user = new User({ name: 'User', email: 'user@test.com', password: 'password' });
  await user.save();

  const userLogin = await request(app).post('/api/users/login').send({ email: 'user@test.com', password: 'password' });
  userToken = userLogin.body.token;

  const product = new Product({ name: 'Test Product', price: 100, description: 'Test description' });
  await product.save();
  productId = product._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await mongoose.connection.close();
});

describe('Cart API', () => {
  it('should add a product to the cart', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('x-auth-token', userToken)
      .send({ productId, quantity: 1 });
    expect(res.statusCode).toEqual(200);
    expect(res.body.products[0].product).toBe(productId.toString());
  });

  it('should get the user cart', async () => {
    const res = await request(app).get('/api/cart').set('x-auth-token', userToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('products');
  });

  it('should update the quantity of a product in the cart', async () => {
    const res = await request(app)
      .put(`/api/cart/${productId}`)
      .set('x-auth-token', userToken)
      .send({ quantity: 2 });
    expect(res.statusCode).toEqual(200);
    expect(res.body.products[0].quantity).toBe(2);
  });

  it('should remove a product from the cart', async () => {
    const res = await request(app).delete(`/api/cart/${productId}`).set('x-auth-token', userToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body.products.length).toBe(0);
  });
});
