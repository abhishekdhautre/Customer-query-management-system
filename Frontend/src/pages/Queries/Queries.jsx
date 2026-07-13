import { useEffect, useState } from 'react';
import { getQueries, getMyQueries, deleteQuery } from '../../services/queryService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import QueryTable from '../../components/QueryTable/QueryTable.jsx';
import SearchBar from '../../components/SearchBar/SearchBar.jsx';
import Filter from '../../components/Filter/Filter.jsx';
import Pagination from '../../components/Pagination/Pagination.jsx';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import styles from './Queries.module.css';

export default function Queries() {
  const { isAdmin } = useAuth();
  const [queries, setQueries] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchQueries = (page = 1) => {
    setLoading(true);
    if (isAdmin) {
      getQueries({ search, ...filters, page, limit: meta.limit })
        .then(({ data }) => {
          setQueries(data.data);
          setMeta(data.meta);
        })
        .finally(() => setLoading(false));
    } else {
      getMyQueries()
        .then(({ data }) => {
          let list = data.data || [];
          if (search) {
            list = list.filter((q) =>
              q.title.toLowerCase().includes(search.toLowerCase())
            );
          }
          if (filters.status) {
            list = list.filter((q) => q.status === filters.status);
          }
          if (filters.priority) {
            list = list.filter((q) => q.priority === filters.priority);
          }
          setQueries(list);
          setMeta({ total: list.length, page: 1, limit: 100 });
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [search, filters, isAdmin]);

  const handleDelete = async () => {
    await deleteQuery(deleteId);
    setDeleteId(null);
    fetchQueries(meta.page);
  };

  return (
    <div>
      <h2 className={styles.title}>
        {isAdmin ? 'All Customer Queries' : 'My Support Queries'}
      </h2>
      
      <div className={styles.toolbar}>
        <SearchBar value={search} onChange={setSearch} />
        <Filter filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <QueryTable queries={queries} onDelete={setDeleteId} />
      )}

      {isAdmin && (
        <Pagination
          page={meta.page}
          total={meta.total}
          limit={meta.limit}
          onPageChange={fetchQueries}
        />
      )}

      {deleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this query?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
