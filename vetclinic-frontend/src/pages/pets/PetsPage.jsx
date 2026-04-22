import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Row, Col, Card, Button, Modal, Alert, Badge,
} from 'react-bootstrap';
import { fetchPets, createPet, clearError } from '../../store/slices/petsSlice';
import { fetchOwners } from '../../store/slices/ownersSlice';
import PetForm from '../../components/pets/PetForm';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { SPECIES_BADGE } from '../../constants/badges';

export default function PetsPage() {
  const dispatch = useDispatch();
  const { list, isLoading, error } = useSelector((s) => s.pets);
  const { list: owners } = useSelector((s) => s.owners);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchPets());
    dispatch(fetchOwners());
  }, [dispatch]);

  const openModal = () => {
    dispatch(clearError());
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleCreate = async (data) => {
    const result = await dispatch(createPet(data));
    if (createPet.fulfilled.match(result)) closeModal();
  };

  const filtered = list.filter((p) =>
    `${p.name} ${p.species} ${p.breed}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Container className="py-4">
      <PageHeader title="Pets" actionLabel="+ New Pet" onAction={openModal} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, species or breed…"
      />

      {isLoading && !list.length && <LoadingSpinner />}

      {!isLoading && error && !showModal && (
        <Alert variant="danger">{error}</Alert>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState
          icon="🐾"
          message={search ? 'No pets match your search.' : 'No pets yet. Add one to get started.'}
        />
      )}

      <Row xs={1} sm={2} lg={3} className="g-3">
        {filtered.map((pet) => (
          <Col key={pet.petId}>
            <Card className="h-100 shadow-sm border-0 card-hover">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-start justify-content-between mb-1">
                  <Card.Title className="fs-6 fw-semibold mb-0">{pet.name}</Card.Title>
                  <Badge bg={SPECIES_BADGE[pet.species] ?? 'secondary'} className="ms-2">
                    {pet.species}
                  </Badge>
                </div>
                {pet.breed && (
                  <Card.Text className="text-muted small mb-1">{pet.breed}</Card.Text>
                )}
                {pet.birthDate && (
                  <Card.Text className="text-muted small mb-0">
                    DOB: {new Date(pet.birthDate).toLocaleDateString()}
                  </Card.Text>
                )}
                <div className="mt-auto pt-3 d-flex gap-2">
                  <Button
                    as={Link}
                    to={`/pets/${pet.petId}`}
                    variant="outline-primary"
                    size="sm"
                  >
                    View Details
                  </Button>
                  <Button
                    as={Link}
                    to={`/pets/${pet.petId}/history`}
                    variant="outline-secondary"
                    size="sm"
                  >
                    History
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Pet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PetForm
            onSubmit={handleCreate}
            onCancel={closeModal}
            isLoading={isLoading}
            error={error}
            owners={owners}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}
