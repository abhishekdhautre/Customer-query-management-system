import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { isAdmin } = useAuth();

  const links = isAdmin
    ? [
        { to: '/', label: 'Dashboard' },
        { to: '/queries', label: 'All Queries' },
        { to: '/queries/create', label: 'Create Query' },
      ]
    : [
        { to: '/', label: 'My Queries' },
        { to: '/queries/create', label: 'Submit Query' },
      ];

  return (
    <aside className={styles.sidebar}>
      <nav>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => (isActive ? styles.active : '')}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
