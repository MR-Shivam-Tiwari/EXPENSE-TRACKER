const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true }, // Keeping as string for simplicity of input/output to match previous
  created_at: { type: Date, default: Date.now },
  idempotency_key: { type: String, unique: true, sparse: true } // sparse allows nulls if we didn't require it, but we kinda do
});

const Expense = mongoose.model('Expense', expenseSchema);

// Routes

// GET /expenses
// Query params: category (string), sort (string: 'date_desc')
app.get('/expenses', async (req, res) => {
  const { category, sort } = req.query;
  const filter = {};

  if (category) {
    filter.category = category;
  }

  const sortOptions = {};
  if (sort === 'date_desc') {
    sortOptions.date = -1; // Newest date first
    sortOptions.created_at = -1; // Tie breaker
  } else {
    sortOptions.created_at = -1; // Default to newest added
  }

  try {
    const expenses = await Expense.find(filter).sort(sortOptions);
    // Map to format expected by frontend (id instead of _id)
    const formatted = expenses.map(e => ({
      id: e._id,
      amount: e.amount,
      category: e.category,
      description: e.description,
      date: e.date,
      created_at: e.created_at
    }));
    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /expenses
// Body: amount, category, description, date, idempotencyKey
app.post('/expenses', async (req, res) => {
  const { amount, category, description, date, idempotencyKey } = req.body;

  if (!amount || !category || !description || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check for idempotency key if provided
    if (idempotencyKey) {
      const existing = await Expense.findOne({ idempotency_key: idempotencyKey });
      if (existing) {
        console.log(`Idempotency hit for key: ${idempotencyKey}`);
        return res.status(200).json({
          id: existing._id,
          amount: existing.amount,
          category: existing.category,
          description: existing.description,
          date: existing.date,
          created_at: existing.created_at,
          idempotency_key: existing.idempotency_key
        });
      }
    }

    const newExpense = new Expense({
      amount,
      category,
      description,
      date,
      idempotency_key: idempotencyKey
    });

    const saved = await newExpense.save();

    res.status(201).json({
      id: saved._id,
      amount: saved.amount,
      category: saved.category,
      description: saved.description,
      date: saved.date,
      created_at: saved.created_at,
      idempotency_key: saved.idempotency_key
    });
  } catch (err) {
    if (err.code === 11000) {
      // Fallback catch for race condition on idempotency (duplicate key error)
      // Logic similar to above read, but simpler to just return error or retry read. 
      // Since we already read, this is rare race condition.
      return res.status(409).json({ error: 'Duplicate request processed' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /expenses/:id
app.delete('/expenses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Expense.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
