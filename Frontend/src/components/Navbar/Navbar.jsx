import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Bell, User } from 'lucide-react';
import { getQueries, getMyQueries } from '../../services/queryService.js';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/queries/create')) return 'Create Query';
    if (location.pathname.startsWith('/queries')) return 'Queries';
    if (location.pathname === '/submit') return 'Submit Query';
    return 'Overview';
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (isAdmin) {
          const { data } = await getQueries({ limit: 5, page: 1 });
          const recentQueries = data.data.map(q => ({
            id: q._id,
            message: `New Query Submitted: ${q.title}`,
            time: new Date(q.createdAt).toLocaleDateString()
          }));
          setNotifications(recentQueries);
        } else {
          const { data } = await getMyQueries();
          const list = data.data || [];
          const statusUpdates = list
            .filter(q => q.status !== 'open')
            .slice(0, 5)
            .map(q => ({
              id: q._id,
              message: `Your query "${q.title}" is now ${q.status}`,
              time: new Date(q.updatedAt || q.createdAt).toLocaleDateString()
            }));
          setNotifications(statusUpdates);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    fetchNotifications();
  }, [isAdmin]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.notifContainer} ref={notifRef}>
          <div className={styles.iconButton} onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            {notifications.length > 0 && <span className={styles.notificationDot} />}
          </div>
          
          {showNotifications && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>Notifications</div>
              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.noNotif}>No new notifications</div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={n.id || i} className={styles.notifItem}>
                      <p>{n.message}</p>
                      <span>{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.divider} />
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            <User size={16} />
          </div>
          <span className={styles.userName}>{user?.name || user?.username || 'User'}</span>
        </div>
      </div>
    </header>
  );
}
