# Expense Tracker Assignment

A modern, full-stack personal finance tool to record and review expenses. Built with **Node.js**, **Express**, **MongoDB Atlas**, and **React (Vite)**.

## 🚀 Features

- **Add Expense**: Record amount, category, description, and date.
- **View Expenses**: See a chronological list of all recorded expenses.
- **Filter**: Filter expenses by category (e.g., Food, Transport).
- **Sort**: Sort by date (Newest First) or insertion order.
- **Total Balance**: Real-time calculation of the total cost of visible expenses.
- **Persistent Storage**: Data is safely stored in the cloud using MongoDB Atlas.
- **Resilience**:
    - **Idempotency**: Prevents duplicate entries on network retries using a unique client-generated key.
    - **Error Handling**: Graceful handling of API errors.

## 🎨 Design & UI

The application features a **professional, clean Blue & White theme**:
- **Minimalist Dashboard**: Efficient side-by-side layout (Form + List).
- **High Contrast**: Crisp typography for excellent readability.
- **Responsive**: Fully distinct mobile and desktop views.
- **Modern Inputs**: Styled form elements with focus states.

## 🛠 Tech Stack

- **Frontend**: React, Vite, CSS (Custom Variables, Flexbox/Grid)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Tooling**: Concurrently (for running both servers), Dotenv

## 🏁 How to Run ("Start A to Z")

### 1. Prerequisites
Ensure you have `node` (v14+) and `npm` installed.

### 2. Configure Environment
1.  **Backend**: Create `backend/.env` and add your MongoDB Atlas connection string:
    ```env
    PORT=3001
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense_tracker?retryWrites=true&w=majority
    ```
2.  **Frontend**: Create `frontend/.env` (Optional, defaults set in code):
    ```env
    VITE_API_URL=/expenses
    ```

### 3. Run the Application
Use the included automation script to install dependencies and start everything:

```bash
chmod +x run.sh
./run.sh
```

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:3001`

## 🏗 Design Decisions & Trade-offs

- **MongoDB Atlas**: Chosen for production-grade reliability and ease of scaling over local SQLite files.
- **Monorepo Structure**: Kept backend and frontend in a single repository for easier submission and review, while maintaining clean separation of concerns.
- **Custom CSS**: Used raw CSS with variables instead of a heavy framework like Tailwind to demonstrate core CSS competency and keep the bundle size small.
- **Idempotency**: Implemented to handle "real-world" flaky networks where a user might double-submit.

## 📝 API Endpoints

- `POST /expenses`: Create a new expense.
- `GET /expenses`: Retrieve expenses (supports `category` and `sort` query params).

---
*Built by Shivam Tiwari*
