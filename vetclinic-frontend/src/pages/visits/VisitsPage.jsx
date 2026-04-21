import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Row, Col, Card, Button, Modal,
  Alert, Spinner, Form, InputGroup, Badge,
} from 'react-bootstrap';
import { fetchVisits, createVisit, clearError } from '../../store/slices/visitsSlice';
import { fetchPets } from '../../store/slices/petsSlice';
import VisitForm from '../../components/visits/VisitForm';

const STATUS_BADGE = {
  Scheduled: 'primary',
  Completed: 'success',
  Cancelled: 'danger',
};

export default function VisitsPage() {
  const dispatch = useDispatch();
  const { list, isLoading, error } = useSelector((s) => s.visits);
  const { list: pets } = useSelector((s) => s.pets);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchVisits());
    dispatch(fetchPets());
  }, [dispatch]);

  const openModal = () => {
    dispatch(clearError());
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleCreate = async (data) => {
    const result = await dispatch(createVisit(data));
    if (createVisit.fulfilled.match(result)) {
      closeModal();
    }
  };

  const petName = (petId) => {
    const pet = pets.find((p) => p.id === petId);
    return pet ? `${pet.name} (${pet.species})` : '—';
  };

  const filtered = list.filter((v) => {
    const name = petName(v.petId).toLowerCase();
    const reason = (v.reason ?? '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || reason.includes(q);
  });

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 page-header">
        <h4 className="fw-bold mb-0">Visits</h4>
        <Button variant="primary" onClick={openModal}>
          + New Visit
        </Button>
      </div>

      <InputGroup className="mb-4" style={{ maxWidth: 360 }}>
        <Form.Control
          placeholder="Search by pet or reason…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button variant="outline-secondary" onClick={() => setSearch('')}>✕</Button>
        )}
      </InputGroup>

      {isLoading && !list.length && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {!isLoading && error && !showModal && (
        <Alert variant="danger">{error}</Alert>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">🩺</span>
          {search ? 'No visits match your search.' : 'No visits yet. Add one to get started.'}
        </div>
      )}

      <Row xs={1} sm={2} lg={3} className="g-3">
        {filtered.map((visit) => (
          <Col key={visit.id}>
            <Card className="h-100 shadow-sm border-0 card-hover">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-start justify-content-between mb-1">
                  <Card.Title className="fs-6 fw-semibold mb-0">
                    {petName(visit.petId)}
                  </Card.Title>
                  <Badge bg={STATUS_BADGE[visit.status] ?? 'secondary'} className="ms-2">
                    {visit.status}
                  </Badge>
                </div>
                <Card.Text className="text-muted small mb-1">
                  {visit.visitDate
                    ? new Date(visit.visitDate).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })
                    : 'Date unknown'}
                </Card.Text>
                {visit.reason && (
                  <Card.Text className="text-muted small mb-0">{visit.reason}</Card.Text>
                )}
                <div className="mt-auto pt-3">
                  <Button
                    as={Link}
                    to={`/visits/${visit.id}`}
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

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Visit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VisitForm
            onSubmit={handleCreate}
            onCancel={closeModal}
            isLoading={isLoading}
            error={error}
            pets={pets}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}
