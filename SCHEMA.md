# 🗄️ Database Schema Documentation

## Overview
This document provides detailed information about the MongoDB database schema for the eCommerce API system.

---

## Collections

### 1. Users Collection

**Purpose**: Store user account information and authentication credentials.

**Schema**:
```javascript
{
  _id: ObjectId,                    // MongoDB generated ID
  name: String,                     // User's full name (required)
  email: String,                    // User's email (required, unique)
  password: String,                 // Hashed password using bcryptjs (required)
  role: String,                     // User role - 'user' or 'admin' (default: 'user')
  createdAt: Date                   // Account creation timestamp
}
```

**Indexes**:
```javascript
// Unique email index for fast lookups and enforcing uniqueness
db.users.createIndex({ email: 1 }, { unique: true })

// Index for finding users by role (useful for admin queries)
db.users.createIndex({ role: 1 })
```

**Example Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36sxkP3C",
  "role": "customer",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

---

### 2. Products Collection

**Purpose**: Store product information and inventory.

**Schema**:
```javascript
{
  _id: ObjectId,                    // MongoDB generated ID
  name: String,                     // Product name (required)
  description: String,              // Product description (required)
  price: Number,                    // Product price in USD (required)
  category: ObjectId,               // Reference to Category (required)
  stock: Number,                    // Current stock quantity (required)
  image: String,                    // URL to product image (optional)
  createdAt: Date,                  // Product creation timestamp
  updatedAt: Date                   // Last update timestamp (auto-managed)
}
```

**Indexes**:
```javascript
// Compound index for category filtering with price sorting
db.products.createIndex({ category: 1, price: 1 })

// Index for text search on name and description
db.products.createIndex({ name: "text", description: "text" })

// Index for stock filtering (useful for inventory management)
db.products.createIndex({ stock: 1 })
```

**Example Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "name": "Laptop Pro 15",
  "description": "High-performance laptop with 16GB RAM and 512GB SSD",
  "price": 1299.99,
  "category": ObjectId("507f1f77bcf86cd799439013"),
  "stock": 42,
  "image": "https://cdn.example.com/products/laptop-pro-15.jpg",
  "createdAt": ISODate("2024-01-10T08:00:00.000Z"),
  "updatedAt": ISODate("2024-01-20T14:30:00.000Z")
}
```

**Constraints**:
- Stock must be >= 0 (validated at application level)
- Price must be > 0
- Stock is automatically decremented when an order is placed

---

### 3. Categories Collection

**Purpose**: Organize products into categories.

**Schema**:
```javascript
{
  _id: ObjectId,                    // MongoDB generated ID
  name: String,                     // Category name (required, unique)
  createdAt: Date                   // Category creation timestamp
}
```

**Indexes**:
```javascript
// Unique index on category name
db.categories.createIndex({ name: 1 }, { unique: true })
```

**Example Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "name": "Electronics",
  "createdAt": ISODate("2024-01-05T10:00:00.000Z")
}
```

---

### 4. Carts Collection

**Purpose**: Store shopping cart information for each user.

**Schema**:
```javascript
{
  _id: ObjectId,                    // MongoDB generated ID
  user: ObjectId,                   // Reference to User (required)
  items: [
    {
      _id: ObjectId,                // Item ID
      product: ObjectId,            // Reference to Product (required)
      quantity: Number              // Quantity of product (required, min: 1)
    }
  ],
  createdAt: Date                   // Cart creation timestamp
}
```

**Indexes**:
```javascript
// Unique index on user (one cart per user)
db.carts.createIndex({ user: 1 }, { unique: true })
```

**Example Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "user": ObjectId("507f1f77bcf86cd799439011"),
  "items": [
    {
      "_id": ObjectId("507f1f77bcf86cd799439015"),
      "product": ObjectId("507f1f77bcf86cd799439012"),
      "quantity": 1
    },
    {
      "_id": ObjectId("507f1f77bcf86cd799439016"),
      "product": ObjectId("507f1f77bcf86cd799439017"),
      "quantity": 2
    }
  ],
  "createdAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

**Important Notes**:
- Each user can have **only one active cart**
- Cart is deleted after order placement
- Items are embedded (not referenced) for performance

---

### 5. Orders Collection

**Purpose**: Store completed orders with full order details.

**Schema**:
```javascript
{
  _id: ObjectId,                    // MongoDB generated ID
  user: ObjectId,                   // Reference to User (required)
  items: [
    {
      _id: ObjectId,                // Item ID
      product: ObjectId,            // Reference to Product (required)
      quantity: Number              // Quantity ordered (required, min: 1)
    }
  ],
  totalAmount: Number,              // Total order amount in USD (required)
  shippingAddress: String,          // Delivery address (required)
  status: String,                   // Order status (default: 'pending')
                                    // Valid values: pending, shipped, delivered, cancelled
  createdAt: Date                   // Order creation timestamp
}
```

**Valid Status Values**:
- `pending` - Order placed, awaiting processing
- `shipped` - Order dispatched to customer
- `delivered` - Order received by customer
- `cancelled` - Order cancelled by admin or system

**Indexes**:
```javascript
// Index for user order lookup (commonly used query)
db.orders.createIndex({ user: 1, createdAt: -1 })

// Index for admin queries (find orders by status)
db.orders.createIndex({ status: 1 })

// Index for date range queries
db.orders.createIndex({ createdAt: -1 })
```

**Example Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439018"),
  "user": ObjectId("507f1f77bcf86cd799439011"),
  "items": [
    {
      "_id": ObjectId("507f1f77bcf86cd799439019"),
      "product": ObjectId("507f1f77bcf86cd799439012"),
      "quantity": 1
    }
  ],
  "totalAmount": 1299.99,
  "shippingAddress": "123 Main Street, New York, NY 10001",
  "status": "shipped",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

**Important Notes**:
- Items are embedded (not referenced) to preserve historical data
- Stock is automatically deducted from products when order is created
- Order details are immutable except for status updates
- An order cannot be modified or deleted once created

---

## Relationships

### Entity-Relationship Diagram

```
┌──────────────────┐
│      User        │
│  (1) ──────── (M)│
│  _id             │
│  name            │
│  email           │
│  role            │
└──────────────────┘
        │
        ├─────────────┬─────────────┐
        │             │             │
    (1:M)         (1:M)         (1:M)
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌────────────┐ ┌──────────┐
│    Cart      │ │   Order    │ │ Category │
│   (1:M)      │ │   (1:M)    │ │ (1:M)    │
│   _id        │ │   _id      │ │ _id      │
│   user_id ───┼─┤   user_id  │ │ name     │
│   items []   │ │   items[]  │ │          │
└──────────────┘ │   total    │ └──────────┘
                 │   status   │      ▲
                 │   address  │      │
                 └────────────┘      │
                        │            │
                    (M:1)            │
                        │            │
    ┌───────────────────┴────────────┘
    │
    ▼
┌──────────────────┐
│    Product       │
│  (M:1)           │
│  _id             │
│  name            │
│  category_id ────┼─────┐ (reference to Category)
│  price           │
│  stock           │
│  createdAt       │
│  updatedAt       │
└──────────────────┘
```

### Relationship Types

1. **User → Cart** (1:1)
   - Each user has at most one active cart
   - Cart is tied to a specific user
   - Foreign key: `cart.user`

2. **User → Order** (1:M)
   - Each user can have multiple orders
   - Orders are specific to a user
   - Foreign key: `order.user`

3. **Product → Category** (M:1)
   - Many products belong to one category
   - Each product has exactly one category
   - Foreign key: `product.category`

4. **Cart → Product** (M:M via embedding)
   - A cart contains multiple products
   - A product can be in multiple carts
   - Relationship stored in `cart.items[]`

5. **Order → Product** (M:M via embedding)
   - An order contains multiple products
   - A product can be in multiple orders
   - Relationship stored in `order.items[]`

---

## Data Flow

### Order Placement Flow

```
1. Customer adds products to cart
   cart.items[] += [{ productId, quantity }]

2. Customer places order
   ├─ Validate stock for each item
   │  product.stock >= cart.items[i].quantity
   │
   ├─ Deduct stock from products
   │  product.stock -= quantity
   │
   ├─ Create order document
   │  order = {
   │    user: customer_id,
   │    items: cart.items,
   │    totalAmount: sum(price * qty),
   │    shippingAddress: address,
   │    status: 'pending'
   │  }
   │
   ├─ Save order to database
   │  db.orders.insertOne(order)
   │
   └─ Delete customer's cart
      db.carts.deleteOne({ user: customer_id })
```

### Stock Management

```
Product Stock Lifecycle:

1. Product Created
   stock = initial_value

2. Customer Places Order
   stock -= order_quantity

3. Admin Updates Stock
   stock += adjustment_value

4. Low Stock Alert
   if stock < threshold: send_notification()

5. Stock = 0
   Product marked as out of stock
```

---

## Indexing Strategy

### Primary Indexes

| Collection | Field(s) | Type | Purpose |
|-----------|---------|------|---------|
| users | email | unique | Login, prevent duplicates |
| categories | name | unique | Category lookup |
| carts | user | unique | One cart per user |
| products | category, price | compound | Category + price filter |
| products | name, description | text | Full-text search |
| orders | user, createdAt | compound | User order history |
| orders | status | single | Admin filtering |

### Query Performance

**Common Queries and Indexes**:

1. **Find products by category with price range** → `{ category: 1, price: 1 }`
2. **Get user's order history** → `{ user: 1, createdAt: -1 }`
3. **Search products** → Text index on name, description
4. **Find orders by status** → `{ status: 1 }`
5. **Authenticate user** → `{ email: 1 }` (unique)

---

## Optimization Recommendations

### 1. Embedding vs Referencing
- ✅ **Embedded**: Items in cart/order (accessed together, immutable historical data)
- ✅ **Referenced**: Products in items (allows price history)
- ❌ **Problem**: Denormalization can cause data duplication

**Solution**: Store price in order.items to preserve historical pricing.

### 2. Collection Size Management
- Monitor collections that grow frequently (orders, carts)
- Implement archiving for old orders
- Use TTL indexes for temporary carts

### 3. Query Optimization
```javascript
// Good: Uses index, single query
db.products.find({ category: id }).limit(10)

// Bad: Multiple queries, no index
for (product in products) {
  db.categories.findOne({ _id: product.category })
}

// Better: Use population in application
Product.find({ category: id }).populate('category').limit(10)
```

### 4. Transaction Support (Future)
For stronger ACID guarantees during order placement:
```javascript
session = db.startSession()
session.startTransaction()
  // Validate and deduct stock
  // Create order
  // Delete cart
session.commitTransaction()
```

---

## Backup & Recovery

### Backup Strategy
```bash
# Full database backup
mongodump --db ecommerce --out ./backups/ecommerce_$(date +%Y%m%d)

# Specific collection backup
mongodump --db ecommerce --collection products --out ./backups/products_$(date +%Y%m%d)
```

### Restore from Backup
```bash
# Restore entire database
mongorestore ./backups/ecommerce_backup

# Restore specific collection
mongorestore --db ecommerce --collection products ./backups/products_backup
```

---

## Monitoring Queries

### Database Statistics
```javascript
// Database size
db.stats()

// Collection sizes
db.products.stats()
db.orders.stats()

// Index information
db.products.getIndexes()
```

### Performance Monitoring
```javascript
// Find slow queries
db.system.profile.find({ millis: { $gt: 100 } })

// Index usage
db.collection.aggregate([{ $indexStats: {} }])
```

---

## Future Schema Enhancements

1. **Product Reviews**
   - New collection for reviews with rating, comment, user reference
   - Index on product_id for fast lookup

2. **Inventory Logs**
   - Track all stock changes for auditing
   - Useful for inventory reconciliation

3. **Payment Information**
   - Payment method details (encrypted)
   - Transaction IDs for payment gateway

4. **Wishlist**
   - Similar structure to cart
   - One wishlist per user

5. **Product Variants**
   - SKU, size, color variations
   - Separate stock tracking per variant

---

**Document Version**: 1.0  
**Last Updated**: January 2024