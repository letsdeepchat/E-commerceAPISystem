# Project Blueprint: E-commerce API

This document provides a comprehensive overview of the Node.js and Express-based e-commerce API. It details the project structure, API endpoints, authentication mechanisms, and testing procedures.

## 1. Project Structure

The project follows a modular, feature-based structure to promote separation of concerns and maintainability.

```
/
├── controllers/      # Handles business logic for each route
├── middleware/       # Express middleware (e.g., for authentication)
├── models/           # Mongoose schemas for database models
├── routes/           # API route definitions
├── tests/            # Jest and Supertest test files
├── .env              # Environment variables (!!! NOT committed to Git)
├── index.js          # Main application entry point
├── package.json      # Project dependencies and scripts
└── blueprint.md      # This file
```

-   **`controllers`**: Contains the core logic for handling requests. Each controller is responsible for interacting with the models and sending back a response.
-   **`middleware`**: Holds functions that execute before the main route handler. This is primarily used for authentication and authorization (`auth.js`).
-   **`models`**: Defines the Mongoose schemas for our MongoDB collections (User, Product, Category, Cart, Order).
-   **`routes`**: Defines the API endpoints and maps them to the corresponding controller functions.
-   **`tests`**: Contains all API test files, written with Jest and Supertest.

## 2. Environment Variables

The project uses a `.env` file to manage environment-specific variables. A `.gitignore` entry prevents this file from being committed to version control.

-   **`MONGO_URI`**: The connection string for your MongoDB database.
-   **`JWT_SECRET`**: A secret key used to sign and verify JSON Web Tokens (JWTs). This should be a long, random, and unique string.
-   **`JWT_EXPIRES_IN`**: The expiration time for JWTs (e.g., `5h`, `1d`).

## 3. Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Server:**
    For development with automatic reloading:
    ```bash
    npm run dev
    ```
    To start the server in a production-like environment:
    ```bash
    npm start
    ```

## 4. API Endpoints

### Authentication (`/api/users`)

-   **`POST /register`**: Creates a new user.
    -   **Body**: `{ "name": "Test User", "email": "test@example.com", "password": "password123" }`
    -   **Response**: Returns a JWT token upon successful registration.

-   **`POST /login`**: Authenticates an existing user.
    -   **Body**: `{ "email": "test@example.com", "password": "password123" }`
    -   **Response**: Returns a JWT token.

-   **`GET /profile`**: Retrieves the profile of the currently authenticated user.
    -   **Headers**: Requires `x-auth-token` with a valid JWT.

### Products (`/api/products`)

-   **`POST /`**: Creates a new product. **(Admin only)**
    -   **Headers**: `x-auth-token` (Admin)
    -   **Body**: `{ "name": "New Product", "price": 19.99, "description": "A great product" }`

-   **`GET /`**: Retrieves all products.

-   **`GET /:id`**: Retrieves a single product by its ID.

-   **`PUT /:id`**: Updates a product. **(Admin only)**
    -   **Headers**: `x-auth-token` (Admin)

-   **`DELETE /:id`**: Deletes a product. **(Admin only)**
    -   **Headers**: `x-auth-token` (Admin)

### Categories (`/api/categories`)

-   **`POST /`**: Creates a new category. **(Admin only)**
    -   **Headers**: `x-auth-token` (Admin)
    -   **Body**: `{ "name": "Electronics" }`

-   **`GET /`**: Retrieves all categories.

-   **`GET /:id`**: Retrieves a single category by its ID.

-   **`PUT /:id`**: Updates a category. **(Admin only)**
    -   **Headers**: `x-auth-token` (Admin)

-   **`DELETE /:id`**: Deletes a category. **(Admin only)**
    -   **Headers**: `x-auth-token` (Admin)

### Cart (`/api/cart`)

-   **`POST /`**: Adds an item to the user's cart. If the cart doesn't exist, it's created.
    -   **Headers**: `x-auth-token` (User)
    -   **Body**: `{ "productId": "...", "quantity": 1 }`

-   **`GET /`**: Retrieves the user's current cart.
    -   **Headers**: `x-auth-token` (User)

-   **`PUT /:productId`**: Updates the quantity of a specific item in the cart.
    -   **Headers**: `x-auth-token` (User)
    -   **Body**: `{ "quantity": 5 }`

-   **`DELETE /:productId`**: Removes an item from the cart.
    -   **Headers**: `x-auth-token` (User)

### Orders (`/api/orders`)

-   **`POST /`**: Creates an order from the user's cart.
    -   **Headers**: `x-auth-token` (User)
    -   **Body**: `{ "shippingAddress": "123 Main St, Anytown, USA" }`

-   **`GET /`**: Retrieves all orders. **(Admin only)**
    -   **Headers**: `x-auth-token` (Admin)

-   **`GET /:id`**: Retrieves a specific order by its ID. A user can only access their own orders. An admin can access any order.
    -   **Headers**: `x-auth-token` (User or Admin)

-   **`PUT /:id`**: Updates the status of an order (e.g., 'Shipped', 'Delivered'). **(Admin only)**
    -   **Headers**: `x-auth-token` (Admin)
    -   **Body**: `{ "status": "Shipped" }`

## 5. Authentication

Authentication is handled via JSON Web Tokens (JWT). When a user logs in or registers, a token is generated and sent to the client. This token must be included in the `x-auth-token` header for all protected routes.

The `middleware/auth.js` file contains two important middleware functions:
-   **`auth`**: Verifies the JWT and attaches the user's payload (`id` and `role`) to the request object. It protects routes that require any logged-in user.
-   **`adminAuth`**: Builds upon the `auth` middleware, additionally checking if the user's role is 'admin'. It protects routes that are restricted to administrators.

## 6. Testing

The project uses **Jest** as the testing framework and **Supertest** to make HTTP requests to the API endpoints.

-   **To run the tests:**
    ```bash
    npm test
    ```
-   **Test Files:** The `tests/` directory contains individual test files for each major feature (auth, products, categories, cart, orders). The tests mock database interactions and cover success cases, error cases, and authorization rules.
