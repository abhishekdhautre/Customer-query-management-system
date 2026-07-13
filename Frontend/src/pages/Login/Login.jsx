import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './Login.module.css';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const switchTab = (t) => { setTab(t); setError(''); setForm({ name: '', email: '', username: '', password: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let endpoint, payload;
      if (tab === 'login') {
        endpoint = '/auth/login';
        payload = { email: form.email, password: form.password };
      } else if (tab === 'register') {
        endpoint = '/auth/register';
        payload = { name: form.name, email: form.email, password: form.password };
      } else {
        endpoint = '/auth/admin/login';
        payload = { username: form.username, password: form.password };
      }
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, payload);
      login(data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`card ${styles.card}`}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          </div>
          QueryFlow
        </div>

        <h1 className={styles.heading}>
          {tab === 'register' ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className={styles.sub}>
          {tab === 'login' && 'Sign in to track your queries.'}
          {tab === 'register' && 'Sign up to start submitting queries.'}
          {tab === 'admin' && 'Admin access only.'}
        </p>

        <div className={styles.tabs}>
          <button type="button" className={tab === 'login' ? styles.activeTab : styles.tab} onClick={() => switchTab('login')}>Login</button>
          <button type="button" className={tab === 'register' ? styles.activeTab : styles.tab} onClick={() => switchTab('register')}>Register</button>
          <button type="button" className={tab === 'admin' ? styles.activeTab : styles.tab} onClick={() => switchTab('admin')}>Admin</button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {tab === 'register' && (
            <div className={styles.field}>
              <label>Full name</label>
              <input type="text" placeholder="Jane Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          )}

          {tab !== 'admin' ? (
            <div className={styles.field}>
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          ) : (
            <div className={styles.field}>
              <label>Username</label>
              <input type="text" placeholder="admin" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
          )}

          <div className={styles.field}>
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Please wait…' : tab === 'register' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className={styles.footer}>
          No account needed — <Link to="/submit">submit a query directly</Link>
        </p>
      </div>
    </div>
  );
}
