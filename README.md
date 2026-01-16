# Expense Tracker - Full Stack Assignment

A production-ready personal finance tool to record and review expenses. Built to handle real-world conditions including unreliable networks, browser refreshes, and retries.

## 🌐 Live Deployment

- **Frontend**: [https://expense-tracker-1mdi.vercel.app](https://expense-tracker-1mdi.vercel.app)
- **Backend API**: [https://expense-tracker-gamma-ebon-34.vercel.app](https://expense-tracker-gamma-ebon-34.vercel.app)
- **Repository**: [GitHub Link](https://github.com/MR-Shivam-Tiwari/EXPENSE-TRACKER)

## ✅ Features Implemented

### Core Requirements
- ✅ Create expense entries (amount, category, description, date)
- ✅ View list of all expenses
- ✅ Filter expenses by category (case-insensitive)
- ✅ Sort expenses by date (newest first)
- ✅ Display total of visible expenses
- ✅ Idempotent API (handles retries and duplicate submissions)
- ✅ Production-grade persistence (MongoDB Atlas)

### Bonus Features
- ✅ **Pie Chart Visualization**: Category-wise expense breakdown
- ✅ **Input Validation**: Required fields, number validation, date validation
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Loading States**: Visual feedback during API calls
- ✅ **Delete Functionality**: Remove individual expenses
- ✅ **Responsive Design**: Mobile and desktop optimized
- ✅ **Professional UI**: Clean blue/white theme with modern aesthetics

## 🛠 Tech Stack

**Frontend:**
- React 18 with Vite
- Recharts (for pie chart visualization)
- Custom CSS with CSS Variables
- UUID for idempotency keys

**Backend:**
- Node.js with Express.js
- MongoDB Atlas (cloud database)
- Mongoose ODM
- CORS configured for production

**Deployment:**
- Frontend: Vercel
- Backend: Vercel Serverless Functions
- Database: MongoDB Atlas (cloud)

## 🏗 Key Design Decisions

### 1. **Idempotency Implementation**
- **Decision**: Client-generated UUID sent with each POST request
- **Why**: Prevents duplicate expenses when users click submit multiple times or retry failed requests
- **How**: Backend checks `idempotency_key` before creating new expense; returns existing expense if key already exists

### 2. **MongoDB Atlas for Persistence**
- **Decision**: Cloud-hosted MongoDB instead of SQLite or in-memory storage
- **Why**: 
  - Production-grade reliability and scalability
  - No file system dependencies (works well with serverless)
  - Built-in replication and backups
  - Easy to deploy and maintain
- **Trade-off**: Requires internet connection; slightly more complex setup than SQLite

### 3. **Money Handling**
- **Decision**: Store amounts as JavaScript `Number` type
- **Why**: Sufficient for this use case; MongoDB handles decimal precision well
- **Trade-off**: For a real financial application, I would use a decimal library (like `decimal.js`) or store as integers (cents) to avoid floating-point precision issues

### 4. **Case-Insensitive Filtering**
- **Decision**: Backend uses MongoDB regex with case-insensitive flag
- **Why**: Better user experience - users can search "food", "Food", or "FOOD"
- **Implementation**: `{ $regex: new RegExp(category, 'i') }`

### 5. **Serverless Deployment**
- **Decision**: Deploy both frontend and backend to Vercel
- **Why**: 
  - Zero-cost hosting for small projects
  - Automatic HTTPS and CDN
  - Git-based deployments
  - Scales automatically
- **Trade-off**: Cold starts on serverless functions; optimized MongoDB connection pooling to mitigate

### 6. **Monorepo Structure**
- **Decision**: Single repository with `/frontend` and `/backend` folders
- **Why**: Easier to review, simpler deployment setup
- **Trade-off**: In a larger team, separate repos might be better for independent versioning

## ⚖️ Trade-offs Made (Due to Time Constraints)

### What I Prioritized:
1. **Correctness over features**: Focused on making core functionality bulletproof
2. **Idempotency**: Spent time ensuring retry safety (critical for real-world use)
3. **User experience**: Added pie chart and case-insensitive search for better UX
4. **Production deployment**: Ensured the app actually works in production, not just localhost

### What I Simplified:
1. **Money precision**: Used `Number` instead of decimal library (acceptable for demo, not for real finance app)
2. **Date handling**: Stored as string instead of proper Date objects (simpler for this scope)
3. **Authentication**: No user accounts (out of scope for this assignment)
4. **Pagination**: Loads all expenses at once (fine for personal use, would need pagination at scale)

## 🚫 What I Intentionally Did Not Do

1. **Automated Tests**: 
   - **Why**: Prioritized working deployment and core features
   - **Would add**: Jest for backend API tests, React Testing Library for frontend

2. **Advanced Validation**:
   - **Why**: Basic validation (required fields, number type) covers most cases
   - **Would add**: Min/max amounts, date range validation, category whitelist

3. **Optimistic UI Updates**:
   - **Why**: Chose to wait for server confirmation to ensure data consistency
   - **Would add**: Optimistic updates with rollback for better perceived performance

4. **Expense Editing**:
   - **Why**: Not in requirements; focused on create/read/delete
   - **Would add**: PUT endpoint and edit UI

5. **Export/Import**:
   - **Why**: Nice-to-have but not critical for MVP
   - **Would add**: CSV export, bulk import

6. **Advanced Analytics**:
   - **Why**: Pie chart covers basic summary; more analytics would need more time
   - **Would add**: Monthly trends, budget tracking, spending insights

## 📡 API Endpoints

### `POST /expenses`
Create a new expense (idempotent)

**Request Body:**
```json
{
  "amount": 450.50,
  "category": "Food",
  "description": "Lunch at Pizza Place",
  "date": "2026-01-16",
  "idempotencyKey": "uuid-v4-string"
}
```

**Response:** `201 Created` or `200 OK` (if idempotency key exists)

### `GET /expenses`
Retrieve expenses with optional filtering and sorting

**Query Parameters:**
- `category` (optional): Filter by category (case-insensitive)
- `sort=date_desc` (optional): Sort by date, newest first

**Response:**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "amount": 450.50,
      "category": "Food",
      "description": "Lunch",
      "date": "2026-01-16",
      "created_at": "2026-01-16T08:00:00.000Z"
    }
  ]
}
```

### `DELETE /expenses/:id`
Delete an expense by ID

**Response:** `200 OK` with confirmation message

## 🚀 Local Development

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account (free tier works)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/MR-Shivam-Tiwari/EXPENSE-TRACKER.git
cd EXPENSE-TRACKER
```

2. **Configure Backend**
Create `backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense_tracker?retryWrites=true&w=majority
```

3. **Configure Frontend**
Create `frontend/.env`:
```env
VITE_API_URL=https://expense-tracker-gamma-ebon-34.vercel.app
```

For local development, use:
```env
VITE_API_URL=http://localhost:3001
```

4. **Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

5. **Run the Application**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🎯 What Makes This Production-Ready

1. **Idempotency**: Handles network retries without creating duplicates
2. **Error Handling**: Graceful degradation with user-friendly messages
3. **Input Validation**: Prevents invalid data from entering the system
4. **CORS Configuration**: Properly configured for production domains
5. **Environment Variables**: Sensitive data not hardcoded
6. **Connection Pooling**: Optimized MongoDB connections for serverless
7. **Responsive Design**: Works on mobile and desktop
8. **Loading States**: Clear feedback during async operations
9. **Data Persistence**: Cloud database with automatic backups
10. **Deployed & Accessible**: Live URLs for immediate testing

## 📝 Notes

- The pie chart uses Recharts library for clean, responsive visualizations
- Category filter supports partial matches (e.g., "foo" matches "Food")
- Dates are displayed in localized format (e.g., "Jan 16, 2026")
- The UI uses a professional blue/white theme with proper contrast ratios
- MongoDB connection is optimized for Vercel's serverless environment

---

**Built by Shivam Tiwari** | [GitHub](https://github.com/MR-Shivam-Tiwari)
