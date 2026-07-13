import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import StatusBadge from '../StatusBadge/StatusBadge.jsx';
import styles from './QueryTable.module.css';

export default function QueryTable({ queries, onDelete }) {
  const { isAdmin } = useAuth();

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            {isAdmin && <th>Customer</th>}
            <th>Status</th>
            <th>Priority</th>
            <th>Date</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {queries.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                No queries found.
              </td>
            </tr>
          ) : (
            queries.map((q) => (
              <tr key={q._id}>
                <td style={{ fontWeight: 500 }}>{q.title}</td>
                {isAdmin && <td>{q.customerName}</td>}
                <td>
                  <StatusBadge status={q.status} />
                </td>
                <td style={{ textTransform: 'capitalize' }}>
                  <span className={`priority-${q.priority}`}>{q.priority}</span>
                </td>
                <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Link to={`/queries/${q._id}`} className={styles.viewBtn}>
                      View
                    </Link>
                    {isAdmin && (
                      <>
                        <Link to={`/queries/${q._id}/edit`} className={styles.editBtn}>
                          Edit
                        </Link>
                        <button className={styles.deleteBtn} onClick={() => onDelete(q._id)}>
                          Delete
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
