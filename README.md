# 🛒 E-Commerce API System

A modern, production-ready backend API for an e-commerce platform built with **Node.js**, **Express.js**, and **MongoDB**.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Architecture Decisions](#architecture-decisions)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Assumptions & Trade-offs](#assumptions--trade-offs)

---

## 🎯 Overview

This API system provides a complete backend solution for e-commerce platforms with features like user authentication, product management, shopping cart, and order management. It follows RESTful principles and includes role-based access control (RBAC) for different user types.

### Key Highlights
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Customer)
- ✅ Stock management and inventory tracking
- ✅ Comprehensive error handling
- ✅ 100% test coverage (32 passing tests)
- ✅ Production-ready security (CORS, Helmet)

---

## ✨ Features

### 1. **User Management**
- User registration with email validation
- Secure login with JWT token generation
- Role-based user system (customer, admin)
- User profile retrieval

### 2. **Product Management**
- Admin: Create, read, update, delete products
- Customer: Browse and search products
- **Pagination support** (default: 10 items per page)
- **Multi-filter support**: by category, price range, search term
- Dynamic `updatedAt` tracking
- Stock management

### 3. **Shopping Cart**
- Add/remove products from cart
- Update product quantities
- Persistent cart tied to user session
- Automatic cart calculation (subtotal, total)

### 4. **Order Management**
- Place orders from cart
- **Automatic stock deduction** when order is placed
- **Stock validation** before order creation
- Order history for customers
- Admin order management
- Order status tracking (pending, shipped, delivered, cancelled)

### 5. **Category Management**
- Admin: Create, read, update, delete categories
- Customer: Browse categories
- Product categorization

---

## 🔧 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 4.x |
| **Database** | MongoDB 4.x+ |
| **Authentication** | JWT (jsonwebtoken) |
| **Password Hashing** | bcryptjs |
| **Security** | Helmet, CORS |
| **Testing** | Jest, Supertest |
| **Validation** | Express validator |
| **Environment** | dotenv |

---

## 📁 Project Structure

```
├── controllers/           # Business logic layer
│   ├── user.controller.js
│   ├── product.controller.js
│   ├── category.controller.js
│   ├── cart.controller.js
│   └── order.controller.js
├── models/               # Database schemas
│   ├── user.model.js
│   ├── product.model.js
│   ├── category.model.js
│   ├── cart.model.js
│   └── order.model.js
├── routes/               # API route definitions
│   ├── user.routes.js
│   ├── product.routes.js
│   ├── category.routes.js
│   ├── cart.routes.js
│   └── order.routes.js
├── middleware/           # Express middleware
│   └── auth.js          # JWT authentication & authorization
├── tests/               # Test suites
│   ├── auth.test.js
│   ├── product.test.js
│   ├── category.test.js
│   ├── cart.test.js
│   ├── order.test.js
│   └── test-utils.js
├── config/              # Configuration files
│   └── swagger.js
├── .env                 # Environment variables (not in Git)
├── index.js             # Application entry point
└── package.json         # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/letsdeepchat/E-commerceAPISystem.git
cd E-commerceAPISystem
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file** (copy from `.env.example` if available)
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
```

4. **Start the server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

5. **Run tests**
```bash
npm test
```

The API will be available at `http://localhost:3000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All authenticated endpoints require the `x-auth-token` header:
```
x-auth-token: <JWT_TOKEN>
```

---

### 👤 User Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2024-01-15T10:30:00Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get User Profile
```http
GET /api/users/profile
x-auth-token: <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 📦 Product Endpoints

#### Get All Products (with Pagination & Filtering)
```http
GET /api/products?page=1&limit=10&category=electronics&minPrice=50&maxPrice=500&search=laptop
x-auth-token: <JWT_TOKEN> (optional)
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | number | Page number | 1 |
| limit | number | Items per page | 10 |
| category | string | Filter by category ID | - |
| minPrice | number | Minimum price | - |
| maxPrice | number | Maximum price | - |
| search | string | Search in name/description | - |

**Response (200 OK):**
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Laptop Pro",
      "description": "High-performance laptop",
      "price": 1299.99,
      "stock": 15,
      "category": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Electronics"
      },
      "image": "https://...",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:45:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50,
    "productsPerPage": 10
  }
}
```

#### Get Single Product
```http
GET /api/products/:id
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Laptop Pro",
  "description": "High-performance laptop",
  "price": 1299.99,
  "stock": 15,
  "category": { "_id": "...", "name": "Electronics" },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z"
}
```

#### Create Product (Admin Only)
```http
POST /api/products
Content-Type: application/json
x-auth-token: <ADMIN_JWT_TOKEN>

{
  "name": "Laptop Pro",
  "description": "High-performance laptop",
  "price": 1299.99,
  "stock": 15,
  "category": "507f1f77bcf86cd799439013",
  "image": "https://example.com/laptop.jpg"
}
```

**Response (201 Created):** Returns created product object

#### Update Product (Admin Only)
```http
PUT /api/products/:id
Content-Type: application/json
x-auth-token: <ADMIN_JWT_TOKEN>

{
  "price": 1199.99,
  "stock": 20
}
```

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id
x-auth-token: <ADMIN_JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "msg": "Product removed"
}
```

---

### 🛍️ Cart Endpoints

#### Get User's Cart
```http
GET /api/cart
x-auth-token: <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "user": "507f1f77bcf86cd799439011",
  "items": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "product": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Laptop Pro",
        "price": 1299.99
      },
      "quantity": 1
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Add Product to Cart
```http
POST /api/cart
Content-Type: application/json
x-auth-token: <JWT_TOKEN>

{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 1
}
```

**Response (201 Created for new cart, 200 OK for existing):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "user": "507f1f77bcf86cd799439011",
  "items": [...],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Update Cart Item Quantity
```http
PUT /api/cart/:productId
Content-Type: application/json
x-auth-token: <JWT_TOKEN>

{
  "quantity": 3
}
```

#### Remove Product from Cart
```http
DELETE /api/cart/:productId
x-auth-token: <JWT_TOKEN>
```

---

### 📋 Order Endpoints

#### Place Order
```http
POST /api/orders
Content-Type: application/json
x-auth-token: <JWT_TOKEN>

{
  "shippingAddress": "123 Main St, City, State 12345"
}
```

**Important:** 
- Cart must contain items
- Stock must be available for all items
- Stock is automatically deducted upon successful order creation

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "user": "507f1f77bcf86cd799439011",
  "items": [...],
  "totalAmount": 1299.99,
  "shippingAddress": "123 Main St, City, State 12345",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Response (400 Bad Request) - Insufficient Stock:**
```json
{
  "msg": "Insufficient stock for product: Laptop Pro. Available: 5, Requested: 10"
}
```

#### Get User's Order History
```http
GET /api/orders/my-orders
x-auth-token: <JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "user": { "_id": "507f1f77bcf86cd799439011", "name": "John Doe" },
    "items": [...],
    "totalAmount": 1299.99,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### Get All Orders (Admin Only)
```http
GET /api/orders
x-auth-token: <ADMIN_JWT_TOKEN>
```

#### Get Order by ID
```http
GET /api/orders/:id
x-auth-token: <JWT_TOKEN>
```

**Note:** Customers can only view their own orders. Admins can view all orders.

#### Update Order Status (Admin Only)
```http
PUT /api/orders/:id
Content-Type: application/json
x-auth-token: <ADMIN_JWT_TOKEN>

{
  "status": "shipped"
}
```

**Valid Status Values:** `pending`, `shipped`, `delivered`, `cancelled`

**Response (200 OK):** Returns updated order object

---

### 📂 Category Endpoints

#### Get All Categories
```http
GET /api/categories
```

#### Get Category by ID
```http
GET /api/categories/:id
```

#### Create Category (Admin Only)
```http
POST /api/categories
Content-Type: application/json
x-auth-token: <ADMIN_JWT_TOKEN>

{
  "name": "Electronics"
}
```

#### Update Category (Admin Only)
```http
PUT /api/categories/:id
Content-Type: application/json
x-auth-token: <ADMIN_JWT_TOKEN>

{
  "name": "Digital Devices"
}
```

#### Delete Category (Admin Only)
```http
DELETE /api/categories/:id
x-auth-token: <ADMIN_JWT_TOKEN>
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram (ERD)

```
┌─────────────┐
│    User     │
├─────────────┤
│ _id (PK)    │
│ name        │
│ email (UQ)  │
│ password    │
│ role        │
│ createdAt   │
└─────────────┘
     │ 1
     │
     ├──── M ───────┐
     │              │
     ▼ M          ▼ M
┌──────────┐   ┌────────┐
│  Cart    │   │ Order  │
├──────────┤   ├────────┤
│ _id (PK) │   │ _id    │
│ user_id  │   │ user_id│
│ items[]  │   │ items[]│
│ createdAt│   │ total  │
└──────────┘   │ status │
               │ address│
               │ created│
               └────────┘
                  │ M
                  │
        ┌─────────┴──────────┐
        │                    │
     ▼ M                  ▼ M
┌──────────┐          ┌─────────┐
│ Product  │ ◄────── │ Category│
├──────────┤  M:1    ├─────────┤
│ _id (PK) │         │ _id (PK)│
│ name     │         │ name    │
│ price    │         │ created │
│ stock    │         └─────────┘
│ category_id│
│ created  │
│ updated  │
└──────────┘
```

### Database Models

#### User Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date (default: now)
}
```

#### Product Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  price: Number (required),
  category: ObjectId (ref: Category, required),
  stock: Number (required),
  image: String,
  createdAt: Date (default: now),
  updatedAt: Date (auto-updated)
}
```

#### Category Schema
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  createdAt: Date (default: now)
}
```

#### Cart Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  items: [
    {
      product: ObjectId (ref: Product, required),
      quantity: Number (required, min: 1, default: 1)
    }
  ],
  createdAt: Date (default: now)
}
```

#### Order Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  items: [
    {
      product: ObjectId (ref: Product, required),
      quantity: Number (required, min: 1)
    }
  ],
  totalAmount: Number (required),
  shippingAddress: String (required),
  status: String (enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending'),
  createdAt: Date (default: now)
}
```

---

## 🏗️ Architecture Decisions

### 1. **Layered Architecture**
- **Controllers**: Handle HTTP requests/responses and orchestrate business logic
- **Models**: Define database schemas with Mongoose
- **Routes**: Define API endpoints and HTTP methods
- **Middleware**: Handle cross-cutting concerns (authentication, authorization)

**Rationale**: Separation of concerns makes code more maintainable and testable.

### 2. **MongoDB (NoSQL) Choice**
- **Document-based**: Flexible schema for evolving requirements
- **Embedding**: Cart and Order items are embedded for performance
- **Relationships**: ObjectId references maintain relational integrity

**Rationale**: NoSQL provides flexibility while MongoDB's rich querying supports complex filters and pagination.

### 3. **JWT Authentication**
- Stateless token-based authentication
- No session storage required
- Easily scalable across multiple servers

**Rationale**: JWT is industry-standard for modern APIs and microservices.

### 4. **Stock Deduction Strategy**
- Validate all stock levels **before** creating order
- Deduct stock from each product **sequentially**
- Atomic operations at product level ensure consistency

**Rationale**: Prevents overselling and maintains inventory accuracy. Real production systems would use MongoDB transactions or message queues for stronger guarantees.

### 5. **Pagination & Filtering**
- Query parameters for flexibility
- Server-side filtering reduces data transfer
- Default page size (10) balances performance and usability

**Rationale**: Improves performance on large datasets and provides better UX.

### 6. **Error Handling**
- Consistent JSON error responses
- HTTP status codes reflect actual errors
- Detailed error messages for debugging

**Rationale**: Makes client integration easier and improves debugging.

---

## 🛡️ Error Handling

### Standard Error Response Format
```json
{
  "msg": "Error message",
  "error": "Detailed error information (in development)"
}
```

### HTTP Status Codes
| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input, insufficient stock |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Admin-only resource, not your order |
| 404 | Not Found | Product/order doesn't exist |
| 500 | Server Error | Database error, unexpected failure |

### Common Error Scenarios

**Insufficient Stock:**
```json
{
  "msg": "Insufficient stock for product: Laptop Pro. Available: 5, Requested: 10"
}
```

**Invalid Credentials:**
```json
{
  "msg": "Invalid credentials"
}
```

**Unauthorized Access:**
```json
{
  "msg": "Not authorized"
}
```

---

## 🧪 Testing

### Test Coverage
```
Test Suites: 5 passed, 5 total
Tests: 32 passed, 32 total
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test auth.test.js
```

### Test Categories

1. **Authentication Tests** (`auth.test.js`)
   - User registration
   - User login
   - JWT token validation
   - Profile retrieval

2. **Product Tests** (`product.test.js`)
   - Get all products (with pagination/filtering)
   - Get single product
   - Create product (admin)
   - Update product
   - Delete product

3. **Category Tests** (`category.test.js`)
   - CRUD operations
   - Admin authorization

4. **Cart Tests** (`cart.test.js`)
   - Add to cart
   - Update quantity
   - Remove from cart
   - Get cart

5. **Order Tests** (`order.test.js`)
   - Place order
   - Stock deduction verification
   - Order history
   - Authorization checks

---

## 📋 Assumptions & Trade-offs

### Assumptions

1. **Email Uniqueness**: Users cannot have duplicate emails
2. **Admin Assignment**: Admins are assigned during user creation (no admin panel)
3. **Role-Based Access**: Only two roles (user, admin) initially
4. **Stock Levels**: Stock cannot go below zero (enforced in tests)
5. **Order Immutability**: Once placed, orders cannot be modified (only status)
6. **Single Currency**: System assumes single currency (no multi-currency support)
7. **Cart Lifespan**: Carts are deleted after order placement

### Trade-offs

| Trade-off | Choice | Rationale |
|-----------|--------|-----------|
| **Data Normalization** | Denormalized (embed items in cart/order) | Faster queries, simpler structure at cost of data duplication |
| **Stock Transactions** | Sequential deduction | Simpler logic, sufficient for MVP. Production would use MongoDB transactions |
| **Caching** | No caching layer | Simplifies development; Redis can be added later |
| **API Versioning** | No versioning | Single version; can add `/v1/` prefix if needed |
| **Rate Limiting** | Not implemented | Can be added with express-rate-limit package |
| **Logging** | Console logs only | Can be enhanced with Winston or Pino |
| **Input Validation** | Basic checks | Production should use express-validator or Joi |

### Future Enhancements

- [ ] Implement MongoDB transactions for atomic stock operations
- [ ] Add Redis caching for frequently accessed products
- [ ] Implement API rate limiting
- [ ] Add comprehensive logging system
- [ ] Support multiple currencies
- [ ] Add payment gateway integration
- [ ] Implement inventory alerts/notifications
- [ ] Add product reviews and ratings
- [ ] Implement wishlist feature
- [ ] Add admin dashboard metrics

---

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS (optional)
CORS_ORIGIN=http://localhost:3000
```

---

## 🔐 Security Considerations

1. **Password Hashing**: Uses bcryptjs with salt rounds = 10
2. **JWT Secrets**: Should be strong and rotated regularly
3. **CORS**: Properly configured to prevent unauthorized requests
4. **Helmet**: Provides various HTTP header protections
5. **Input Validation**: Basic validation on all inputs
6. **Role-Based Access**: Admin routes protected with middleware

**Production Recommendations:**
- Use environment-specific configuration
- Implement rate limiting
- Add request validation with Joi or express-validator
- Use HTTPS/TLS
- Implement comprehensive logging
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Regular security audits

---

## 📞 Support & Contribution

For issues or suggestions, please create an issue in the GitHub repository.

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

**Last Updated**: January 2024
**Current Version**: 1.0.0