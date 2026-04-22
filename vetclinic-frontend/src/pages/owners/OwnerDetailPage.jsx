import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import {
  fetchOwner, updateOwner, deleteOwner, clearSelected, clearError,
} from '../../store/slices/ownersSlice';
import { useAuth } from '../../hooks/useAuth';
import OwnerForm from '../../components/owners/OwnerForm';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageLoadError from '../../components/ui/PageLoadError';

export default function OwnerDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { selected, isLoading, error } = useSelector((s) => s.owners);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(fetchOwner(id));
    return () => dispatch(clearSelected());
  }, [dispatch, id]);

  const startEdit = () => {
    dispatch(clearError());
    setEditing(true);
  };

  const cancelEdit = () => {
    dispatch(clearError());
    setEditing(false);
  };

  const handleUpdate = async (data) => {
    const result = await dispatch(updateOwner({ id, data }));
    if (updateOwner.fulfilled.match(result)) setEditing(false);
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteOwner(id));
    if (deleteOwner.fulfilled.match(result)) navigate('/owners', { replace: true });
  };

  if (isLoading && !selected) return <LoadingSpinner />;

  if (!isLoading && error && !selected) {
    return <PageLoadError message={error} backTo="/owners" backLabel="Back to Owners" />;
  }

  if (!selected) return null;

  return (
    <Container className="py-4" style={{ maxWidth: 680 }}>
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <Button as={Link} to="/owners" variant="outline-secondary" size="sm">
          ← Back
        </Button>
        <h4 className="fw-bold mb-0">{selected.fullName}</h4>
      </div>

      {error && editing && <Alert variant="danger">{error}</Alert>}

      {editing ? (
        <Card className="shadow-sm border-0 p-4">
          <OwnerForm
            initialValues={selected}
            onSubmit={handleUpdate}
            onCancel={cancelEdit}
            isLoading={isLoading}
            error={null}
          />
        </Card>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <dl className="row mb-0 detail-list">
              <dt className="col-sm-4 text-muted fw-normal">Full Name</dt>
              <dd className="col-sm-8 fw-semibold">{selected.fullName}</dd>

              <dt className="col-sm-4 text-muted fw-normal">Email</dt>
              <dd className="col-sm-8">{selected.email}</dd>

              <dt className="col-sm-4 text-muted fw-normal">Phone</dt>
              <dd className="col-sm-8">{selected.phone}</dd>

              <dt className="col-sm-4 text-muted fw-normal">Address</dt>
              <dd className="col-sm-8 mb-0">{selected.address}</dd>
            </dl>

            <div className="d-flex gap-2 mt-4 flex-wrap">
              <Button variant="primary" size="sm" onClick={startEdit}>
                Edit Owner
              </Button>
              {isAdmin && (
                <Button variant="outline-danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                  Delete Owner
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      <ConfirmModal
        show={showDeleteModal}
        title="Delete Owner"
        body={<>Are you sure you want to delete <strong>{selected.fullName}</strong>? This action cannot be undone.</>}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isLoading}
      />
    </Container>
  );
}
