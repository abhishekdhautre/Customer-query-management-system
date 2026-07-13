import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '4rem', color: '#1a73e8' }}>404</h1>
      <p style={{ color: '#555', marginBottom: '20px' }}>Page not found</p>
      <Link to="/" style={{ color: '#1a73e8' }}>Go to Dashboard</Link>
    </div>
  );
}
