import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Card, Button, Alert, Spinner, Badge, ListGroup, Row, Col,
} from 'react-bootstrap';
import { fetchPendingVets, approveVet } from '../../store/slices/adminSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminVeterinariansPage() {
  const dispatch = useDispatch();
  const { pendingVets, isLoading, error, approving } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchPendingVets());
  }, [dispatch]);

  const handleApprove = (id) => {
    dispatch(approveVet(id));
  };

  return (
    <Container className="py-4" style={{ maxWidth: 760 }}>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-0">Pending Veterinarians</h4>
          <p className="text-muted small mb-0 mt-1">
            Approve newly registered veterinarians to grant them access.
          </p>
        </div>
        {pendingVets.length > 0 && (
          <Badge bg="warning" text="dark" className="fs-6 px-3 py-2">
            {pendingVets.length} pending
          </Badge>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading && !pendingVets.length && <LoadingSpinner />}

      {!isLoading && !error && pendingVets.length === 0 && (
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center text-muted py-5">
            <div className="mb-2 fs-4">✓</div>
            No pending veterinarians. All accounts are approved.
          </Card.Body>
        </Card>
      )}

      {pendingVets.length > 0 && (
        <ListGroup variant="flush" className="shadow-sm rounded">
          {pendingVets.map((vet) => {
            const isApproving = approving.includes(vet.id);
            return (
              <ListGroup.Item key={vet.id} className="py-3 px-4">
                <Row className="align-items-center g-2">
                  <Col xs={12} sm>
                    <div className="fw-semibold">{vet.fullName}</div>
                    <div className="text-muted small">{vet.email}</div>
                  </Col>
                  <Col xs="auto">
                    <Badge bg="secondary" className="me-2">Veterinarian</Badge>
                    <Badge bg="warning" text="dark">Pending</Badge>
                  </Col>
                  <Col xs="auto">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(vet.id)}
                      disabled={isApproving}
                    >
                      {isApproving ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1" />
                          Approving…
                        </>
                      ) : (
                        'Approve'
                      )}
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}
    </Container>
  );
}
