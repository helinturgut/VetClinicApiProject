import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Row, Col, Card, Button, Modal,
  Alert, Spinner, Form, InputGroup,
} from 'react-bootstrap';
import { fetchOwners, createOwner, clearError } from '../../store/slices/ownersSlice';
import OwnerForm from '../../components/owners/OwnerForm';

export default function OwnersPage() {
  const dispatch = useDispatch();
  const { list, isLoading, error } = useSelector((s) => s.owners);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchOwners());
  }, [dispatch]);

  const openModal = () => {
    dispatch(clearError());
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleCreate = async (data) => {
    const result = await dispatch(createOwner(data));
    if (createOwner.fulfilled.match(result)) {
      closeModal();
    }
  };

  const filtered = list.filter((o) =>
    `${o.firstName} ${o.lastName} ${o.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 page-header">
        <h4 className="fw-bold mb-0">Owners</h4>
        <Button variant="primary" onClick={openModal}>
          + New Owner
        </Button>
      </div>

      {/* Search */}
      <InputGroup className="mb-4" style={{ maxWidth: 360 }}>
        <Form.Control
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button variant="outline-secondary" onClick={() => setSearch('')}>
            ✕
          </Button>
        )}
      </InputGroup>

      {/* Loading */}
      {isLoading && !list.length && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* Fetch error */}
      {!isLoading && error && !showModal && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* Empty state */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">👤</span>
          {search ? 'No owners match your search.' : 'No owners yet. Add one to get started.'}
        </div>
      )}

      {/* Owner cards */}
      <Row xs={1} sm={2} lg={3} className="g-3">
        {filtered.map((owner) => (
          <Col key={owner.id}>
            <Card className="h-100 shadow-sm border-0 card-hover">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fs-6 fw-semibold mb-1">
                  {owner.firstName} {owner.lastName}
                </Card.Title>
                <Card.Text className="text-muted small mb-1">{owner.email}</Card.Text>
                <Card.Text className="text-muted small mb-0">{owner.phone}</Card.Text>
                <div className="mt-auto pt-3">
                  <Button
                    as={Link}
                    to={`/owners/${owner.id}`}
                    variant="outline-primary"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Create Owner Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Owner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OwnerForm
            onSubmit={handleCreate}
            onCancel={closeModal}
            isLoading={isLoading}
            error={error}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}
