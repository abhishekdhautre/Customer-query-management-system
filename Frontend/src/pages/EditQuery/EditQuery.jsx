import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQueryById, updateQuery } from '../../services/queryService.js';
import QueryForm from '../../components/QueryForm/QueryForm.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import styles from './EditQuery.module.css';

export default function EditQuery() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getQueryById(id).then(({ data }) => setQuery(data.data));
  }, [id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await updateQuery(id, data);
      navigate(`/queries/${id}`);
    } finally {
      setLoading(false);
    }
  };

  if (!query) return <Loader />;

  return (
    <div>
      <h2 className={styles.title}>Edit Query</h2>
      <QueryForm defaultValues={query} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
