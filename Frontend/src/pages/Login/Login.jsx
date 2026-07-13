import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import Lightfall from '../../components/Lightfall/Lightfall.jsx';
import styles from './Login.module.css';

export default function Login() {
  const [activeTab, setActiveTab] = useState('user-login'); // 'user-login', 'user-register', 'admin-login'
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setForm({ name: '', email: '', username: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let endpoint = '';
    let payload = {};

    try {
      if (activeTab === 'user-login') {
        endpoint = '/auth/login';
        payload = { email: form.email, password: form.password };
      } else if (activeTab === 'user-register') {
        endpoint = '/auth/register';
        payload = { name: form.name, email: form.email, password: form.password };
      } else if (activeTab === 'admin-login') {
        endpoint = '/auth/admin/login';
        payload = { username: form.username, password: form.password };
      }

      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, payload);
      login(data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundContainer}>
        <Lightfall
          colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#020412"
          speed={0.8}
          streakCount={8}
          streakWidth={1}
          streakLength={1.2}
          glow={1.2}
          density={0.8}
          twinkle={1}
          zoom={2.5}
          backgroundGlow={0.6}
          opacity={0.35}
          mouseInteraction={true}
          mouseStrength={1}
          mouseRadius={0.8}
        />
      </div>
      <div className={styles.card}>
        <h2 className={styles.title}>
          {activeTab === 'user-register' ? 'Create Account' : 'Portal Sign In'}
        </h2>
        
        <div className={styles.tabs}>
          <button 
            type="button"
            className={`${styles.tab} ${activeTab === 'user-login' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('user-login')}
          >
            Customer Login
          </button>
          <button 
            type="button"
            className={`${styles.tab} ${activeTab === 'user-register' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('user-register')}
          >
            Sign Up
          </button>
          <button 
            type="button"
            className={`${styles.tab} ${activeTab === 'admin-login' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('admin-login')}
          >
            Staff Access
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {activeTab === 'user-register' && (
            <div className={styles.field}>
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>
          )}

          {activeTab !== 'admin-login' ? (
            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="customer@example.com"
              />
            </div>
          ) : (
            <div className={styles.field}>
              <label>Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                placeholder="admin"
              />
            </div>
          )}

          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Processing...' : activeTab === 'user-register' ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footerText}>
          Need help? <a href="/submit">Submit a direct query</a> without logging in.
        </p>
      </div>
    </div>
  );
}
