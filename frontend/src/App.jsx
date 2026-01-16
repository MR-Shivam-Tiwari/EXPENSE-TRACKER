import { useState, useEffect, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './App.css'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

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
      setExpenses(data.data || []);
      setError(null);
    } catch (err) {
      console.log(err);
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

    if (!amount || !category || !description || !date) {
      alert("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description,
          date,
          idempotencyKey
        }),
      });

      if (!res.ok) throw new Error('Failed to create expense');

      setAmount('');
      setCategory('');
      setDescription('');
      setDate('');
      setIdempotencyKey(uuidv4());
      fetchExpenses();
    } catch (err) {
      alert("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  const categoryData = useMemo(() => {
    const data = {};
    expenses.forEach(exp => {
      const cat = exp.category || 'Other';
      if (data[cat]) data[cat] += exp.amount;
      else data[cat] = exp.amount;
    });
    return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [expenses]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await fetch(`/expenses/${id}`, { method: 'DELETE' });
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="container">
      <h1>EXPENSE TRACKER</h1>

      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

      <div className="top-section">
        <div className="card">
          <h2>New Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Lunch" required />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Food" list="cats" required />
              <datalist id="cats">
                <option value="Food" /><option value="Transport" /><option value="Utilities" /><option value="Entertainment" />
              </datalist>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Expense'}</button>
          </form>
        </div>

        <div className="card chart-card">
          <div className="summary-header">
            <h2>Overview</h2>
            <div className="total-balance">
              <span>Total Balance</span>
              <h3>₹{totalAmount.toFixed(2)}</h3>
            </div>
          </div>
          <div className="chart-wrapper">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${val.toFixed(2)}`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No data</div>
            )}
          </div>
        </div>
      </div>

      <div className="bottom-section">
        <div className="controls">
          <div className="control-group">
            <input value={filterCategory} onChange={e => setFilterCategory(e.target.value)} placeholder="Filter Category..." />
          </div>
          <div className="control-group">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="">Sort by Added</option>
              <option value="date_desc">Sort by Date</option>
            </select>
          </div>
        </div>

        <div className="list">
          {expenses.length === 0 ? <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>No expenses found.</div> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Desc</th><th>Category</th><th>Amount</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(exp.date)}</td>
                      <td>{exp.description}</td>
                      <td><span className="category-tag">{exp.category}</span></td>
                      <td style={{ fontWeight: 'bold' }}>₹{exp.amount.toFixed(2)}</td>
                      <td><button className="delete-btn" onClick={() => handleDelete(exp.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App