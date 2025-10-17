
import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', '-password');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Place a new order
export const placeOrder = async (req, res) => {
  const { shippingAddress } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // Validate stock for all items before creating order
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          msg: `Insufficient stock for product: ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Start transaction-like operation: deduct stock from all products
    for (const item of cart.items) {
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    const order = new Order({
      user: req.user.id,
      items: cart.items,
      totalAmount: cart.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0),
      shippingAddress,
      status: 'pending'
    });

    await order.save();
    await Cart.findByIdAndDelete(cart.id);

    res.status(201).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error: Failed to create order', error: err.message });
  }
};

// Get an order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', '-password');
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Ensure user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get user's order history
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .populate('user', '-password')
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.json({ orders: [], msg: 'No orders found' });
    }

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Update an order's status
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    // Validate status value
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        msg: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};
