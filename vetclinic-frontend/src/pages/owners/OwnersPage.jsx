import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Row, Col, Card, Button, Modal, Alert, Spinner,
} from 'react-bootstrap';
import { fetchOwners, createOwner, clearError } from '../../store/slices/ownersSlice';
import OwnerForm from '../../components/owners/OwnerForm';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';

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
    if (createOwner.fulfilled.match(result)) closeModal();
  };

  const filtered = list.filter((o) =>
    `${o.firstName} ${o.lastName} ${o.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Container className="py-4">
      <PageHeader title="Owners" actionLabel="+ New Owner" onAction={openModal} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name or email…"
        style={{ maxWidth: 360, marginBottom: '1.5rem' }}
      />

      {isLoading && !list.length && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {!isLoading && error && !showModal && (
        <Alert variant="danger">{error}</Alert>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState
          icon="👤"
          message={search ? 'No owners match your search.' : 'No owners yet. Add one to get started.'}
        />
      )}

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
