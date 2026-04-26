import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Card, Button, Alert, Badge, ListGroup } from 'react-bootstrap';
import { fetchPet, fetchPetHistory, clearSelected } from '../../store/slices/petsSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageLoadError from '../../components/ui/PageLoadError';
import { STATUS_BADGE } from '../../constants/badges';

export default function PetHistoryPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected, history, isLoading, error } = useSelector((s) => s.pets);

  useEffect(() => {
    dispatch(fetchPet(id));
    dispatch(fetchPetHistory(id));
    return () => dispatch(clearSelected());
  }, [dispatch, id]);

  if (isLoading && !selected) return <LoadingSpinner />;

  if (!isLoading && error && !selected) {
    return <PageLoadError message={error} backTo="/pets" backLabel="Back to Pets" />;
  }

  return (
    <Container className="py-4" style={{ maxWidth: 720 }}>
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <Button as={Link} to={`/pets/${id}`} variant="outline-secondary" size="sm">
          ← Back to Pet
        </Button>
        <h4 className="fw-bold mb-0">
          Visit History{selected ? ` — ${selected.name}` : ''}
        </h4>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading && <LoadingSpinner />}

      {!isLoading && history.length === 0 && !error && (
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center text-muted py-5">
            No visit history found for this pet.
          </Card.Body>
        </Card>
      )}

      {history.length > 0 && (
        <ListGroup variant="flush" className="shadow-sm rounded">
          {history.map((visit) => (
            <ListGroup.Item key={visit.id} className="py-3 px-4">
              <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
                <div>
                  <div className="fw-semibold mb-1">
                    {visit.visitDate
                      ? new Date(visit.visitDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Date unknown'}
                  </div>
                  {visit.reason && (
                    <div className="text-muted small mb-1">
                      <strong>Reason:</strong> {visit.reason}
                    </div>
                  )}
                  {visit.notes && (
                    <div className="text-muted small">{visit.notes}</div>
                  )}
                </div>
                <div className="d-flex flex-column align-items-end gap-1">
                  {visit.status && (
                    <Badge bg={STATUS_BADGE[visit.status] ?? 'secondary'}>
                      {visit.status}
                    </Badge>
                  )}
                  <Button
                    as={Link}
                    to={`/visits/${visit.id}`}
                    variant="outline-primary"
                    size="sm"
                  >
                    View Visit
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}
