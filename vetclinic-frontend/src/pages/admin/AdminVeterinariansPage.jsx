import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Card, Button, Alert, Spinner, Badge, ListGroup, Row, Col, Nav, Tab,
} from 'react-bootstrap';
import {
  fetchPendingVets, fetchApprovedVets, approveVet, rejectVet, deleteVet,
} from '../../store/slices/adminSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function AdminVeterinariansPage() {
  const dispatch = useDispatch();
  const {
    pendingVets, approvedVets,
    isLoading, isLoadingApproved,
    error, approving, rejecting, deleting,
  } = useSelector((s) => s.admin);

  const [confirmDelete, setConfirmDelete] = useState(null); // { userId, fullName }

  useEffect(() => {
    dispatch(fetchPendingVets());
    dispatch(fetchApprovedVets());
  }, [dispatch]);

  const handleApprove = (id) => dispatch(approveVet(id));
  const handleReject = (id) => dispatch(rejectVet(id));
  const handleDeleteClick = (vet) => setConfirmDelete({ userId: vet.userId, fullName: vet.fullName });
  const handleDeleteConfirm = () => {
    dispatch(deleteVet(confirmDelete.userId));
    setConfirmDelete(null);
  };

  return (
    <Container className="py-4" style={{ maxWidth: 760 }}>
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Veterinarian Management</h4>
        <p className="text-muted small mb-0 mt-1">
          Manage pending and approved veterinarian accounts.
        </p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => dispatch({ type: 'admin/clearError' })}>{error}</Alert>}

      <Tab.Container defaultActiveKey="pending">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="pending">
              Pending
              {pendingVets.length > 0 && (
                <Badge bg="warning" text="dark" className="ms-2">{pendingVets.length}</Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="approved">
              Approved
              {approvedVets.length > 0 && (
                <Badge bg="success" className="ms-2">{approvedVets.length}</Badge>
              )}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* ── Pending tab ── */}
          <Tab.Pane eventKey="pending">
            {isLoading && !pendingVets.length && <LoadingSpinner />}

            {!isLoading && pendingVets.length === 0 && (
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
                  const isApproving = approving.includes(vet.userId);
                  const isRejecting = rejecting.includes(vet.userId);
                  const isBusy = isApproving || isRejecting;
                  return (
                    <ListGroup.Item key={vet.userId} className="py-3 px-4">
                      <Row className="align-items-center g-2">
                        <Col xs={12} sm>
                          <div className="fw-semibold">{vet.fullName}</div>
                          <div className="text-muted small">{vet.email}</div>
                        </Col>
                        <Col xs="auto">
                          <Badge bg="warning" text="dark">Pending</Badge>
                        </Col>
                        <Col xs="auto" className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(vet.userId)}
                            disabled={isBusy}
                          >
                            {isApproving ? (
                              <><Spinner animation="border" size="sm" className="me-1" />Approving…</>
                            ) : 'Approve'}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(vet.userId)}
                            disabled={isBusy}
                          >
                            {isRejecting ? (
                              <><Spinner animation="border" size="sm" className="me-1" />Rejecting…</>
                            ) : 'Reject'}
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            )}
          </Tab.Pane>

          {/* ── Approved tab ── */}
          <Tab.Pane eventKey="approved">
            {isLoadingApproved && !approvedVets.length && <LoadingSpinner />}

            {!isLoadingApproved && approvedVets.length === 0 && (
              <Card className="shadow-sm border-0">
                <Card.Body className="text-center text-muted py-5">
                  No approved veterinarians found.
                </Card.Body>
              </Card>
            )}

            {approvedVets.length > 0 && (
              <ListGroup variant="flush" className="shadow-sm rounded">
                {approvedVets.map((vet) => {
                  const isDeleting = deleting.includes(vet.userId);
                  return (
                    <ListGroup.Item key={vet.userId} className="py-3 px-4">
                      <Row className="align-items-center g-2">
                        <Col xs={12} sm>
                          <div className="fw-semibold">{vet.fullName}</div>
                          <div className="text-muted small">{vet.email}</div>
                        </Col>
                        <Col xs="auto">
                          <Badge bg="success">Approved</Badge>
                        </Col>
                        <Col xs="auto">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(vet)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <><Spinner animation="border" size="sm" className="me-1" />Deleting…</>
                            ) : 'Delete'}
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      <ConfirmModal
        show={!!confirmDelete}
        title="Delete Veterinarian"
        body={`Are you sure you want to delete ${confirmDelete?.fullName ?? ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
        isLoading={false}
      />
    </Container>
  );
}
