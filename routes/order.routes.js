
import express from 'express';
import { getAllOrders, placeOrder, getOrderById, updateOrderStatus, getUserOrders } from '../controllers/order.controller.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all orders
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.route('/').get(adminAuth, getAllOrders).post(auth, placeOrder);

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get user's order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's order history
 *       401:
 *         description: Unauthorized
 */
router.get('/my-orders', auth, getUserOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: The order data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *   put:
 *     summary: Update an order's status (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.route('/:id').get(auth, getOrderById).put(adminAuth, updateOrderStatus);

export default router;
