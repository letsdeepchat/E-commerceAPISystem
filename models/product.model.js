
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update updatedAt before saving
ProductSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to update updatedAt on findByIdAndUpdate
ProductSchema.pre('findByIdAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Product = mongoose.model('Product', ProductSchema);

export default Product;
