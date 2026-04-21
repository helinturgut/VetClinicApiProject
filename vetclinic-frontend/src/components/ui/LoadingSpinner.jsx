import { Spinner } from 'react-bootstrap';

export default function LoadingSpinner({ message, size }) {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <Spinner animation="border" variant="primary" size={size} role="status">
        <span className="visually-hidden">Loading…</span>
      </Spinner>
      {message && <span className="text-muted ms-2">{message}</span>}
    </div>
  );
}
