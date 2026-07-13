import { useState } from 'react';
import styles from './QueryForm.module.css';

const initial = { title: '', description: '', customerName: '', customerEmail: '', status: 'open', priority: 'medium' };

export default function QueryForm({ defaultValues = {}, onSubmit, loading }) {
  const [form, setForm] = useState({ ...initial, ...defaultValues });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title) e.title = 'Required';
    if (!form.description) e.description = 'Required';
    if (!form.customerName) e.customerName = 'Required';
    if (!/\S+@\S+\.\S+/.test(form.customerEmail)) e.customerEmail = 'Valid email required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) return setErrors(e2);
    onSubmit(form);
  };

  const field = (name, label, type = 'text') => (
    <div className={styles.group}>
      <label>{label}</label>
      <input type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
      {errors[name] && <span className={styles.error}>{errors[name]}</span>}
    </div>
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {field('title', 'Title')}
      <div className={styles.group}>
        <label>Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {errors.description && <span className={styles.error}>{errors.description}</span>}
      </div>
      {field('customerName', 'Customer Name')}
      {field('customerEmail', 'Customer Email', 'email')}
      <div className={styles.group}>
        <label>Status</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {['open', 'in-progress', 'resolved', 'closed'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className={styles.group}>
        <label>Priority</label>
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          {['low', 'medium', 'high'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <button className={styles.submit} type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Query'}
      </button>
    </form>
  );
}
