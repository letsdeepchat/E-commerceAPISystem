
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
    if (!cart) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    const order = new Order({
      user: req.user.id,
      items: cart.items,
      totalAmount: cart.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0),
      shippingAddress
    });

    await order.save();
    await Cart.findByIdAndDelete(cart.id);

    res.status(201).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update an order's status
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
