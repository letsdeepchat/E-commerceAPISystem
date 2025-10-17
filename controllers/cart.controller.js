
import Cart from '../models/cart.model.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add to cart
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      // Cart exists, update it
      const itemIndex = cart.items.findIndex(p => p.product == productId);

      if (itemIndex > -1) {
        // Product exists in cart, update quantity
        let productItem = cart.items[itemIndex];
        productItem.quantity += quantity;
        cart.items[itemIndex] = productItem;
      } else {
        // Product does not exist in cart, add new item
        cart.items.push({ product: productId, quantity });
      }
      cart = await cart.save();
      return res.status(200).send(cart);
    } else {
      // No cart for user, create new cart
      const newCart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity }]
      });

      return res.status(201).send(newCart);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update cart item
export const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    const itemIndex = cart.items.findIndex(p => p.product == productId);

    if (itemIndex > -1) {
      let productItem = cart.items[itemIndex];
      productItem.quantity = quantity;
      cart.items[itemIndex] = productItem;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    cart.items = cart.items.filter(p => p.product != productId);

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
