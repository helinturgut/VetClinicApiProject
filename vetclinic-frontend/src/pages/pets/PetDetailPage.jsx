import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Card, Button, Alert, Spinner, Badge, Modal,
} from 'react-bootstrap';
import {
  fetchPet, updatePet, deletePet, clearSelected, clearError,
} from '../../store/slices/petsSlice';
import { fetchOwners } from '../../store/slices/ownersSlice';
import { useAuth } from '../../hooks/useAuth';
import PetForm from '../../components/pets/PetForm';

const SPECIES_BADGE = {
  Dog: 'warning',
  Cat: 'info',
  Bird: 'success',
  Rabbit: 'secondary',
};

export default function PetDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin, isVet } = useAuth();
  const { selected, isLoading, error } = useSelector((s) => s.pets);
  const { list: owners } = useSelector((s) => s.owners);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canDelete = isAdmin || isVet;

  useEffect(() => {
    dispatch(fetchPet(id));
    dispatch(fetchOwners());
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
    const result = await dispatch(updatePet({ id, data }));
    if (updatePet.fulfilled.match(result)) {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deletePet(id));
    if (deletePet.fulfilled.match(result)) {
      navigate('/pets', { replace: true });
    }
  };

  const ownerName = () => {
    const owner = owners.find((o) => o.id === selected?.ownerId);
    return owner ? `${owner.firstName} ${owner.lastName}` : '—';
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
        <Button as={Link} to="/pets" variant="outline-secondary" size="sm">
          ← Back to Pets
        </Button>
      </Container>
    );
  }

  if (!selected) return null;

  return (
    <Container className="py-4" style={{ maxWidth: 680 }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button as={Link} to="/pets" variant="outline-secondary" size="sm">
          ← Back
        </Button>
        <h4 className="fw-bold mb-0">{selected.name}</h4>
        <Badge bg={SPECIES_BADGE[selected.species] ?? 'secondary'}>
          {selected.species}
        </Badge>
      </div>

      {error && editing && <Alert variant="danger">{error}</Alert>}

      {editing ? (
        <Card className="shadow-sm border-0 p-4">
          <PetForm
            initialValues={{
              ...selected,
              birthDate: selected.birthDate ? selected.birthDate.slice(0, 10) : '',
            }}
            onSubmit={handleUpdate}
            onCancel={cancelEdit}
            isLoading={isLoading}
            error={null}
            owners={owners}
          />
        </Card>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <dl className="row mb-0 detail-list">
              <dt className="col-sm-4 text-muted fw-normal">Name</dt>
              <dd className="col-sm-8 fw-semibold">{selected.name}</dd>

              <dt className="col-sm-4 text-muted fw-normal">Species</dt>
              <dd className="col-sm-8">{selected.species}</dd>

              <dt className="col-sm-4 text-muted fw-normal">Breed</dt>
              <dd className="col-sm-8">{selected.breed || '—'}</dd>

              <dt className="col-sm-4 text-muted fw-normal">Date of Birth</dt>
              <dd className="col-sm-8">
                {selected.birthDate
                  ? new Date(selected.birthDate).toLocaleDateString()
                  : '—'}
              </dd>

              <dt className="col-sm-4 text-muted fw-normal">Owner</dt>
              <dd className="col-sm-8 mb-0">
                {owners.length > 0 ? (
                  <Link to={`/owners/${selected.ownerId}`}>{ownerName()}</Link>
                ) : (
                  ownerName()
                )}
              </dd>
            </dl>

            <div className="d-flex gap-2 mt-4 flex-wrap">
              <Button variant="primary" size="sm" onClick={startEdit}>
                Edit Pet
              </Button>
              <Button
                as={Link}
                to={`/pets/${selected.id}/history`}
                variant="outline-secondary"
                size="sm"
              >
                Visit History
              </Button>
              {canDelete && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Pet
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Pet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{selected.name}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
