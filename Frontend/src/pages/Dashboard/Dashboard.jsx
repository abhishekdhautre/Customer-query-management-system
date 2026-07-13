import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getQueriesStats, getQueries } from '../../services/queryService.js';
import StatusBadge from '../../components/StatusBadge/StatusBadge.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import styles from './Dashboard.module.css';

const STATUS_LABELS = {
  open: 'Open Tickets',
  'in-progress': 'Active Progress',
  resolved: 'Resolved Issues',
  closed: 'Closed Archives',
};

export default function Dashboard() {
  const [stats, setStats] = useState({ open: 0, 'in-progress': 0, resolved: 0, closed: 0 });
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getQueriesStats().then(({ data }) => data.data).catch(() => ({ open: 0, 'in-progress': 0, resolved: 0, closed: 0 })),
      getQueries({ limit: 4, page: 1 }).then(({ data }) => data.data).catch(() => [])
    ])
      .then(([statsData, queriesData]) => {
        setStats(statsData);
        setRecentQueries(queriesData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const totalQueries = Object.values(stats).reduce((a, b) => a + b, 0);
  const resolvedClosed = (stats.resolved || 0) + (stats.closed || 0);
  const resolutionRate = totalQueries > 0 ? Math.round((resolvedClosed / totalQueries) * 100) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>System Analytics Dashboard</h2>
          <p className={styles.subtitle}>Overview of customer satisfaction and support queues.</p>
        </div>
        <Link to="/queries/create" className={styles.createBtn}>
          + Create New Ticket
        </Link>
      </div>

      <div className={styles.metricsGrid}>
        {/* Total Queries KPI */}
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{totalQueries}</span>
          <span className={styles.kpiLabel}>Total Inquiries</span>
          <div className={styles.kpiIndicator} style={{ background: 'var(--primary)' }}></div>
        </div>

        {/* Resolution Rate KPI */}
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{resolutionRate}%</span>
          <span className={styles.kpiLabel}>Resolution Efficiency</span>
          <div className={styles.progressBarBg}>
            <div className={styles.progressBar} style={{ width: `${resolutionRate}%` }}></div>
          </div>
        </div>


        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{(stats.open || 0) + (stats['in-progress'] || 0)}</span>
          <span className={styles.kpiLabel}>Active Backlog</span>
          <div className={styles.kpiIndicator} style={{ background: 'var(--warning)' }}></div>
        </div>
      </div>

      <div className={styles.cards}>
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <div key={status} className={`${styles.card} ${styles[status + 'Card']}`}>
            <span className={styles.count}>{stats[status] ?? 0}</span>
            <span className={styles.label}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.dashboardGrid}>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Recent Customer Tickets</h3>
            <Link to="/queries" className={styles.viewAll}>View All →</Link>
          </div>
          <div className={styles.panelBody}>
            {recentQueries.length === 0 ? (
              <p className={styles.emptyText}>No recent queries found.</p>
            ) : (
              <div className={styles.recentList}>
                {recentQueries.map((q) => (
                  <div key={q._id} className={styles.recentItem}>
                    <div className={styles.recentMain}>
                      <span className={styles.recentTitle}>{q.title}</span>
                      <span className={styles.recentMeta}>
                        by {q.customerName} • {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles.recentBadges}>
                      <span className={`priority-${q.priority} ${styles.priorityBadge}`}>{q.priority}</span>
                      <StatusBadge status={q.status} />
                      <Link to={`/queries/${q._id}`} className={styles.actionLink}>View</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Agent Quick Actions</h3>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.actionsGrid}>
              <Link to="/queries/create" className={styles.actionBtn}>

                <div className={styles.actionInfo}>
                  <span className={styles.actionTitle}>Log Customer Query</span>
                  <span className={styles.actionDesc}>Open a ticket manually for a customer.</span>
                </div>
              </Link>

              <Link to="/queries" className={styles.actionBtn}>

                <div className={styles.actionInfo}>
                  <span className={styles.actionTitle}>Search Support Queue</span>
                  <span className={styles.actionDesc}>Filter and process active support items.</span>
                </div>
              </Link>

              <div className={styles.systemStatusCard}>
                <span className={styles.systemLabel}>Operational Status</span>
                <div className={styles.systemIndicatorGroup}>
                  <span className={styles.statusPulse}></span>
                  <span className={styles.statusSystemText}>All systems online & active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
