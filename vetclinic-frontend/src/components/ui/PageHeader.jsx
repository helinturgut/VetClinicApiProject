import { Button } from 'react-bootstrap';

export default function PageHeader({ title, actionLabel, onAction }) {
  return (
    <div className="d-flex align-items-center justify-content-between mb-3 page-header">
      <h4 className="fw-bold mb-0">{title}</h4>
      {actionLabel && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
