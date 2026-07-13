import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { submitQuery } from '../../services/queryService.js';
import styles from './SubmitQuery.module.css';

export default function SubmitQuery() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    customerName: '',
    customerEmail: '',
    priority: 'medium',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-populate when user context changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm((prev) => ({
        ...prev,
        customerName: user.name || '',
        customerEmail: user.email || '',
      }));
    }
  }, [user, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitQuery(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({
      title: '',
      description: '',
      customerName: isAuthenticated && user ? user.name : '',
      customerEmail: isAuthenticated && user ? user.email : '',
      priority: 'medium',
    });
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={`card ${styles.successBox}`}>
          <h2 className={styles.successTitle}>Query Submitted!</h2>
          <p className={styles.successText}>
            Thank you for reaching out. We have logged your request and will get back to you shortly.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <button onClick={handleReset} className="btn-primary" style={{ maxWidth: '240px' }}>
              Submit Another Query
            </button>
            <Link to="/" className={styles.navLink}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`card ${styles.card}`}>
        <h2 className={styles.title}>Submit a Query</h2>
        <p className={styles.description}>
          Have an issue or a question? Open a query and our team will get on it.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>Your Name</label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                required
                disabled={isAuthenticated}
                placeholder="John Doe"
              />
              {isAuthenticated && <div className={styles.readonlyInfo}>✓ Logged-in profile</div>}
            </div>

            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                required
                disabled={isAuthenticated}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Subject / Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Account subscription query"
            />
          </div>

          <div className={styles.field}>
            <label>Detailed Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
              placeholder="Describe your issue or request in detail..."
            />
          </div>

          <div className={styles.field}>
            <label>Priority Level</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low (General Inquiry)</option>
              <option value="medium">Medium (Requires Attention)</option>
              <option value="high">High (Urgent Blockers)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Submitting query...' : 'Submit Request'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" className={styles.navLink}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
