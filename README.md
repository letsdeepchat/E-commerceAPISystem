# E-commerceAPISystem

This is a back-end API for an e-commerce platform built with Node.js and Express.

## Project Structure

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

## Getting Started

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
