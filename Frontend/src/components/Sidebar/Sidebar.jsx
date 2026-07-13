import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, MessageSquare, PlusCircle, LogOut, Hexagon } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const links = isAdmin
    ? [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/queries', label: 'Queries', icon: MessageSquare },
        { to: '/queries/create', label: 'Create Query', icon: PlusCircle },
      ]
    : [
        { to: '/', label: 'My Queries', icon: MessageSquare },
        { to: '/submit', label: 'Submit Query', icon: PlusCircle },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Hexagon className={styles.brandIcon} size={24} />
        <span className={styles.brandText}>QueryFlow</span>
      </div>
      
      <nav className={styles.nav}>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottomNav}>
        <button className={`${styles.link} ${styles.logout}`} onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
