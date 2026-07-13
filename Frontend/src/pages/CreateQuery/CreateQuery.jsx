import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QueryForm from '../../components/QueryForm/QueryForm.jsx';
import { createQuery } from '../../services/queryService.js';
import styles from './CreateQuery.module.css';

export default function CreateQuery() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await createQuery(data);
      navigate('/queries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className={styles.title}>New Query</h2>
      <QueryForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
