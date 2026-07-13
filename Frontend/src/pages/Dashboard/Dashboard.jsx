import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getQueriesStats, getQueries, getMyQueries } from '../../services/queryService.js';
import StatusBadge from '../../components/StatusBadge/StatusBadge.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import { Layers, CircleDot, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import styles from './Dashboard.module.css';

function StatCard({ label, value, color, Icon, description }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{label}</span>
        <Icon size={20} color={color} />
      </div>
      <div className={styles.statContent}>
        <span className={styles.statValue}>{value}</span>
      </div>
      <p className={styles.statDescription}>{description}</p>
    </div>
  );
}

function UserDashboard() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyQueries().then(({ data }) => setQueries(data.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const stats = queries.reduce(
    (acc, q) => {
      const status = q.status || 'open';
      if (acc[status] !== undefined) {
        acc[status]++;
      }
      if (q.priority === 'High') {
        acc.highPriority++;
      }
      return acc;
    },
    { open: 0, 'in-progress': 0, resolved: 0, closed: 0, highPriority: 0 }
  );

  const total = queries.length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Welcome back!</h2>
          <p className={styles.subtitle}>
            Here's an overview of your recent query activity.
          </p>
        </div>
        <Link to="/submit" className="btn-primary">New Query</Link>
      </div>

      <div className={styles.stats}>
        <StatCard label="Total Queries" value={total} color="var(--primary)" Icon={Layers} description="All time queries submitted" />
        <StatCard label="Open Queries" value={stats.open} color="var(--info)" Icon={CircleDot} description="Queries awaiting response" />
        <StatCard label="Resolved Queries" value={stats.resolved} color="var(--success)" Icon={CheckCircle2} description="Successfully resolved" />
        <StatCard label="High Priority" value={stats.highPriority} color="var(--danger)" Icon={AlertTriangle} description="Requires immediate attention" />
      </div>

      <div className="card">
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Recent Queries</h3>
          <Link to="/queries" className={styles.panelLink}>
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {queries.length === 0 ? (
          <p className={styles.empty}>No queries found. <Link to="/submit">Submit your first query.</Link></p>
        ) : (
          <div className={styles.list}>
            {queries.slice(0, 5).map((q) => (
              <div key={q._id} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.rowTitle}>{q.title}</span>
                  <span className={styles.rowMeta}>{new Date(q.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.rowRight}>
                  <span className={`badge priority-${(q.priority || 'medium').toLowerCase()}`}>{q.priority}</span>
                  <StatusBadge status={q.status} />
                  <Link to={`/queries/${q._id}`} className={styles.viewLink}>View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({ open: 0, 'in-progress': 0, resolved: 0, closed: 0, highPriority: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getQueriesStats().then(({ data }) => data.data).catch(() => ({ open: 0, 'in-progress': 0, resolved: 0, closed: 0 })),
      getQueries({ limit: 5, page: 1 }).then(({ data }) => {
        // Compute high priority stats manually if backend doesn't provide
        return data.data;
      }).catch(() => []),
      // Also let's get all to compute high priority if needed, or rely on stats if they add it. Let's compute manually from recent for now, or just get all briefly if required. Assuming getQueriesStats gives us basic, we will compute highPriority from the recent list as a fallback, or just 0 if not provided. Actually, the prompt says "Display four summary cards... High Priority Queries". Let's fetch all queries or assume stats provides it. If stats doesn't, we will default to 0.
      getQueries({ limit: 1, page: 1, priority: 'High' }).then(({ data }) => data.meta?.total || 0).catch(() => 0)
    ]).then(([s, q, highPriorityCount]) => { 
      setStats({ ...s, highPriority: highPriorityCount }); 
      setRecent(q); 
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const total = (stats.open || 0) + (stats['in-progress'] || 0) + (stats.resolved || 0) + (stats.closed || 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>System Overview</h2>
          <p className={styles.subtitle}>Track and manage all customer queries across the platform.</p>
        </div>
        <Link to="/queries/create" className="btn-primary">Create Query</Link>
      </div>

      <div className={styles.stats}>
        <StatCard label="Total Queries" value={total} color="var(--primary)" Icon={Layers} description="Across all customers" />
        <StatCard label="Open Queries" value={stats.open || 0} color="var(--info)" Icon={CircleDot} description="Awaiting support agent" />
        <StatCard label="Resolved Queries" value={stats.resolved || 0} color="var(--success)" Icon={CheckCircle2} description="Successfully resolved" />
        <StatCard label="High Priority" value={stats.highPriority} color="var(--danger)" Icon={AlertTriangle} description="Critical issues" />
      </div>

      <div className="card">
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Recent Queries</h3>
          <Link to="/queries" className={styles.panelLink}>
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className={styles.empty}>No queries found.</p>
        ) : (
          <div className={styles.list}>
            {recent.map((q) => (
              <div key={q._id} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.rowTitle}>{q.title}</span>
                  <span className={styles.rowMeta}>{q.customerName} &middot; {new Date(q.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.rowRight}>
                  <span className={`badge priority-${(q.priority || 'medium').toLowerCase()}`}>{q.priority}</span>
                  <StatusBadge status={q.status} />
                  <Link to={`/queries/${q._id}`} className="btn-secondary">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}
