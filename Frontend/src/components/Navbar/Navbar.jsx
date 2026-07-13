import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.navbar}>
      <h1 className={styles.logo}>
        {isAdmin ? 'QueryFlow — Admin Portal' : 'QueryFlow — Customer Desk'}
      </h1>
      <div className={styles.userInfo}>
        {user && (
          <span className={styles.userName}>
            Welcome, <strong>{user.name || user.username || 'User'}</strong>
          </span>
        )}
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
