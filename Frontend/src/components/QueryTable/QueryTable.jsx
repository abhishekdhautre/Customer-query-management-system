import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import StatusBadge from '../StatusBadge/StatusBadge.jsx';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import styles from './QueryTable.module.css';

export default function QueryTable({ queries, onDelete, onStatusChange }) {
  const { isAdmin } = useAuth();

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {isAdmin && <th>Customer Name</th>}
            {isAdmin && <th>Email</th>}
            <th>Subject</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Created Date</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {queries.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 7 : 5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                No queries found.
              </td>
            </tr>
          ) : (
            queries.map((q) => (
              <tr key={q._id}>
                {isAdmin && <td className={styles.fw500}>{q.customerName}</td>}
                {isAdmin && <td>{q.customerEmail || 'N/A'}</td>}
                <td className={styles.fw500}>{q.title}</td>
                <td>
                  {isAdmin ? (
                    <select
                      value={q.status}
                      onChange={(e) => onStatusChange(q._id, e.target.value)}
                      className={`${styles.statusSelect} ${styles[q.status]}`}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : (
                    <StatusBadge status={q.status} />
                  )}
                </td>
                <td>
                  <span className={`badge priority-${(q.priority || 'medium').toLowerCase()}`}>{q.priority}</span>
                </td>
                <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <Link to={`/queries/${q._id}`} className={`${styles.iconBtn} ${styles.viewBtn}`} title="View">
                      <Eye size={16} />
                    </Link>
                    {isAdmin && (
                      <>
                        <Link to={`/queries/${q._id}/edit`} className={`${styles.iconBtn} ${styles.editBtn}`} title="Edit">
                          <Edit2 size={16} />
                        </Link>
                        <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => onDelete(q._id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
