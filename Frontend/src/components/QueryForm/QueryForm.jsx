import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QueryForm.module.css';

const initial = { title: '', description: '', customerName: '', customerEmail: '', status: 'open', priority: 'medium' };

export default function QueryForm({ defaultValues = {}, onSubmit, loading, showStatus = true }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...initial, ...defaultValues });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title) e.title = 'Title is required';
    if (!form.description) e.description = 'Description is required';
    if (!form.customerName) e.customerName = 'Customer name is required';
    if (!/\S+@\S+\.\S+/.test(form.customerEmail)) e.customerEmail = 'Valid email is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      return;
    }
    onSubmit(form);
  };

  const field = (name, label, type = 'text') => {
    const hasError = !!errors[name];
    return (
      <div className={styles.group}>
        <label htmlFor={name}>{label}</label>
        <input 
          id={name}
          type={type} 
          value={form[name]} 
          onChange={(e) => {
            setForm({ ...form, [name]: e.target.value });
            if (hasError) setErrors({ ...errors, [name]: '' });
          }} 
          className={hasError ? styles.inputError : ''}
        />
        {hasError && <span className={styles.errorMessage}>{errors[name]}</span>}
      </div>
    );
  };

  return (
    <div className={styles.formContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {field('customerName', 'Customer Name')}
        {field('customerEmail', 'Email Address', 'email')}
        {field('title', 'Subject')}
        
        <div className={styles.group}>
          <label htmlFor="description">Description</label>
          <textarea 
            id="description"
            value={form.description} 
            onChange={(e) => {
              setForm({ ...form, description: e.target.value });
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            className={errors.description ? styles.inputError : ''}
            rows={5}
          />
          {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
        </div>

        {showStatus && (
          <div className={styles.row}>
            <div className={styles.group}>
              <label htmlFor="status">Status</label>
              <select 
                id="status"
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="open">Open</option>
                <option value="in-progress">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className={styles.group}>
              <label htmlFor="priority">Priority</label>
              <select 
                id="priority"
                value={form.priority} 
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
