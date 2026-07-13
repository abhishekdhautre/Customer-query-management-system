import styles from './Filter.module.css';

export default function Filter({ filters, onChange }) {
  return (
    <div className={styles.filters}>
      <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
        <option value="">All Status</option>
        {['open', 'in-progress', 'resolved', 'closed'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select value={filters.priority} onChange={(e) => onChange({ ...filters, priority: e.target.value })}>
        <option value="">All Priority</option>
        {['low', 'medium', 'high'].map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
}
