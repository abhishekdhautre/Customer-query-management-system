import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getQueryById, deleteQuery } from '../../services/queryService.js';
import StatusBadge from '../../components/StatusBadge/StatusBadge.jsx';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import styles from './QueryDetails.module.css';

export default function QueryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [query, setQuery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getQueryById(id)
      .then(({ data }) => setQuery(data.data))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch query details.');
      });
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteQuery(id);
      navigate(isAdmin ? '/queries' : '/');
    } catch {
      setError('Failed to delete query.');
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className="card" style={{ textAlign: 'center', borderColor: 'var(--danger)' }}>
          <h3 style={{ color: 'var(--danger)', marginBottom: '12px' }}>Access Denied</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{error}</p>
          <Link to="/" className="btn" style={{ background: 'var(--primary)', color: '#fff' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!query) return <Loader />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Query Reference #{query._id.slice(-6).toUpperCase()}</h2>
        {isAdmin && (
          <div className={styles.actions}>
            <Link to={`/queries/${id}/edit`} className={styles.editBtn}>
              Edit
            </Link>
            <button className={styles.deleteBtn} onClick={() => setShowModal(true)}>
              Delete
            </button>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.detailRow}>
          <div className={styles.detailLabel}>Subject</div>
          <div className={styles.detailValue} style={{ fontWeight: 600 }}>{query.title}</div>
        </div>

        {isAdmin && (
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Customer</div>
            <div className={styles.detailValue}>
              {query.customerName} ({query.customerEmail})
            </div>
          </div>
        )}

        <div className={styles.detailRow}>
          <div className={styles.detailLabel}>Status</div>
          <div className={styles.detailValue}>
            <StatusBadge status={query.status} />
          </div>
        </div>

        <div className={styles.detailRow}>
          <div className={styles.detailLabel}>Priority</div>
          <div className={styles.detailValue} style={{ textTransform: 'capitalize' }}>
            {query.priority}
          </div>
        </div>

        <div className={styles.detailRow}>
          <div className={styles.detailLabel}>Created</div>
          <div className={styles.detailValue}>
            {new Date(query.createdAt).toLocaleString()}
          </div>
        </div>

        <div className={styles.descriptionBox}>
          <div className={styles.descriptionLabel}>Description</div>
          <div className={styles.description}>{query.description}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          ← Back to Queries
        </Link>
      </div>

      {showModal && (
        <ConfirmModal
          message="Delete this query permanently?"
          onConfirm={handleDelete}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
