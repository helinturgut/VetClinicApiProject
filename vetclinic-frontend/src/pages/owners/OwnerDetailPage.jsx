import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import {
  fetchOwner, updateOwner, clearSelected, clearError,
} from '../../store/slices/ownersSlice';
import OwnerForm from '../../components/owners/OwnerForm';

export default function OwnerDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected, isLoading, error } = useSelector((s) => s.owners);
  const [editing, setEditing] = useState(false);

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
    if (updateOwner.fulfilled.match(result)) {
      setEditing(false);
    }
  };

  if (isLoading && !selected) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!isLoading && error && !selected) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/owners" variant="outline-secondary" size="sm">
          ← Back to Owners
        </Button>
      </Container>
    );
  }

  if (!selected) return null;

  return (
    <Container className="py-4" style={{ maxWidth: 680 }}>
      {/* Breadcrumb-style header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button as={Link} to="/owners" variant="outline-secondary" size="sm">
          ← Back
        </Button>
        <h4 className="fw-bold mb-0">
          {selected.firstName} {selected.lastName}
        </h4>
      </div>

      {/* Error banner for update failures */}
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
              <dt className="col-sm-4 text-muted fw-normal">First Name</dt>
              <dd className="col-sm-8 fw-semibold">{selected.firstName}</dd>

              <dt className="col-sm-4 text-muted fw-normal">Last Name</dt>
              <dd className="col-sm-8 fw-semibold">{selected.lastName}</dd>

              <dt className="col-sm-4 text-muted fw-normal">Email</dt>
              <dd className="col-sm-8">{selected.email}</dd>

              <dt className="col-sm-4 text-muted fw-normal">Phone</dt>
              <dd className="col-sm-8">{selected.phone}</dd>

              <dt className="col-sm-4 text-muted fw-normal">Address</dt>
              <dd className="col-sm-8 mb-0">{selected.address}</dd>
            </dl>

            <div className="d-flex gap-2 mt-4">
              <Button variant="primary" size="sm" onClick={startEdit}>
                Edit Owner
              </Button>
              {/* Owners cannot be deleted per system rules */}
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
