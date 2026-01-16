# Expense Tracker Assignment

A modern, full-stack personal finance tool to record and review expenses. Built with Node/Express/MongoDB Atlas and React/Vite.

## How to Run ("Start A to Z")

1.  **Prerequisites**: Ensure `node` and `npm` are installed.
2.  **Configure MongoDB Atlas**:
    - Update `backend/.env` with your MongoDB Atlas connection string:
      ```
      MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense_tracker?retryWrites=true&w=majority
      ```
3.  **Run the application**:
    ```bash
    chmod +x run.sh
    ./run.sh
    ```
    This script will:
    - Install dependencies for backend and frontend.
    - Start the backend server on port 3001.
    - Start the frontend dev server on port 5173.
    - You can access the app at `http://localhost:5173`.

## Features
- **Add Expense**: Record amount, category, description, and date with a beautiful, modern UI.
- **View Expenses**: See a list of all recorded expenses in an elegant table.
- **Filter**: Filter by category (e.g., Food, Transport).
- **Sort**: Sort by date (Newest First) or default insertion order.
- **Total**: View the total cost of visible expenses with real-time updates.
- **Persistence**: Data is saved to MongoDB Atlas for cloud-based, production-ready storage.
- **Resilience**:
    - **Idempotency**: The frontend generates a unique key for each new expense form session. Retrying the same request (e.g. network failure) will not create duplicates.
    - **Error Handling**: The frontend handles errors gracefully and allows retries.

## Design Decisions & Trade-offs
- **MongoDB Atlas**: Chose MongoDB Atlas for cloud-based persistence, providing production-ready scalability and reliability without local database setup.
- **Idempotency**: Implemented using a client-generated UUID sent in the request body. Unique index in MongoDB ensures exactly-once insertion.
- **Modern UI**: Implemented a professional design with gradient backgrounds, glassmorphism effects, smooth animations, and a carefully chosen color palette for an exceptional user experience.
- **Monorepo**: Kept backend and frontend in one repo for simplicity of submission and coordination, but separated into distinct folders to simulate a real architecture.
- **Validation**: Basic validation on both frontend (HTML5 attributes) and backend (mongoose schema validation).

## API Endpoints
- `POST /expenses`: Create expense.
- `GET /expenses`: List expenses (supports `category` and `sort` query params).
