import { Modal, Button, Spinner } from 'react-bootstrap';

export default function ConfirmModal({
  show,
  title,
  body,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  isLoading,
}) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              Deleting…
            </>
          ) : (
            confirmLabel
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
