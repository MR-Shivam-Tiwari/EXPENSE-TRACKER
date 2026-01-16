import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid';
import './App.css'

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');

  // Generate a key on initial load or after successful submit
  useEffect(() => {
    setIdempotencyKey(uuidv4());
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/expenses?';
      if (filterCategory) url += `category=${encodeURIComponent(filterCategory)}&`;
      if (sortBy) url += `sort=${encodeURIComponent(sortBy)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, sortBy]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!amount || !category || !description || !date) {
      alert("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description,
          date,
          idempotencyKey
        }),
      });

      if (!res.ok) throw new Error('Failed to create expense');

      // Success
      setAmount('');
      setCategory('');
      setDescription('');
      setDate('');
      setIdempotencyKey(uuidv4()); // Rotate key for next new expense
      fetchExpenses(); // Refresh list
    } catch (err) {
      setError(err.message);
      // Do NOT rotate idempotency key here, so user can retry!
      alert("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Derive unique categories for filter dropdown
  // We can't easily get *all* categories from backend efficiently without a separate endpoint, 
  // but for this assignment we can just let user type or preset some. 
  // Requirement says "User can filter expenses by category". 
  // Let's assume standard categories or just text input. Text input is flexible.

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      const res = await fetch(`/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete expense');

      // Update state locally
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      fetchExpenses(); // Optional: sync with backend to be safe
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      <h1>EXPENSE TRACKER</h1>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>New Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Description</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Lunch"
              required
            />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Food"
              required
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              <option value="Food" />
              <option value="Transport" />
              <option value="Utilities" />
              <option value="Entertainment" />
            </datalist>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Expense'}
          </button>
        </form>
      </div>

      <div className="main-content">
        <div className="summary">
          <span>Total Balance</span>
          <h3>₹{totalAmount.toFixed(2)}</h3>
        </div>

        <div className="controls">
          <div className="control-group">
            <input
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              placeholder="Filter by Category..."
              list="category-suggestions"
            />
          </div>
          <div className="control-group">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="">Sort by Added</option>
              <option value="date_desc">Sort by Date</option>
            </select>
          </div>
        </div>

        <div className="list">
          {loading && expenses.length === 0 ? (
            <p>Loading...</p>
          ) : expenses.length === 0 ? (
            <p style={{ padding: '20px', color: '#94a3b8' }}>No expenses recorded yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Desc</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td style={{ color: '#64748b' }}>{exp.date}</td>
                    <td>{exp.description}</td>
                    <td>
                      <span style={{
                        background: '#eff6ff',
                        color: '#3b82f6',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', color: '#1e293b' }}>₹{exp.amount.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          fontWeight: '600'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
