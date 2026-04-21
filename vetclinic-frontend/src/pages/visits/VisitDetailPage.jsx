import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Card, Button, Alert, Spinner, Badge,
  Tab, Tabs, ListGroup, Modal,
} from 'react-bootstrap';
import {
  fetchVisit, updateVisit, deleteVisit,
  fetchDiagnoses, addDiagnosis,
  fetchTreatments, addTreatment,
  clearSelected, clearError,
} from '../../store/slices/visitsSlice';
import { fetchPets } from '../../store/slices/petsSlice';
import { useAuth } from '../../hooks/useAuth';
import VisitForm from '../../components/visits/VisitForm';
import DiagnosisForm from '../../components/visits/DiagnosisForm';
import TreatmentForm from '../../components/visits/TreatmentForm';

const STATUS_BADGE = {
  Scheduled: 'primary',
  Completed: 'success',
  Cancelled: 'danger',
};

export default function VisitDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { selected, diagnoses, treatments, isLoading, error } = useSelector((s) => s.visits);
  const { list: pets } = useSelector((s) => s.pets);

  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiagForm, setShowDiagForm] = useState(false);
  const [showTreatForm, setShowTreatForm] = useState(false);

  useEffect(() => {
    dispatch(fetchVisit(id));
    dispatch(fetchDiagnoses(id));
    dispatch(fetchTreatments(id));
    dispatch(fetchPets());
    return () => dispatch(clearSelected());
  }, [dispatch, id]);

  const petName = () => {
    const pet = pets.find((p) => p.id === selected?.petId);
    return pet ? `${pet.name} (${pet.species})` : '—';
  };

  const startEdit = () => {
    dispatch(clearError());
    setEditing(true);
  };

  const cancelEdit = () => {
    dispatch(clearError());
    setEditing(false);
  };

  const handleUpdate = async (data) => {
    const result = await dispatch(updateVisit({ id, data }));
    if (updateVisit.fulfilled.match(result)) setEditing(false);
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteVisit(id));
    if (deleteVisit.fulfilled.match(result)) navigate('/visits', { replace: true });
  };

  const handleAddDiagnosis = async (data) => {
    const result = await dispatch(addDiagnosis({ visitId: id, data }));
    if (addDiagnosis.fulfilled.match(result)) setShowDiagForm(false);
  };

  const handleAddTreatment = async (data) => {
    const result = await dispatch(addTreatment({ visitId: id, data }));
    if (addTreatment.fulfilled.match(result)) setShowTreatForm(false);
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
        <Button as={Link} to="/visits" variant="outline-secondary" size="sm">
          ← Back to Visits
        </Button>
      </Container>
    );
  }

  if (!selected) return null;

  return (
    <Container className="py-4" style={{ maxWidth: 760 }}>
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <Button as={Link} to="/visits" variant="outline-secondary" size="sm">
          ← Back
        </Button>
        <h4 className="fw-bold mb-0">
          Visit — {selected.visitDate
            ? new Date(selected.visitDate).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })
            : 'Date unknown'}
        </h4>
        <Badge bg={STATUS_BADGE[selected.status] ?? 'secondary'}>
          {selected.status}
        </Badge>
      </div>

      {error && editing && <Alert variant="danger">{error}</Alert>}

      <Tabs defaultActiveKey="details" className="mb-3">
        {/* ── Details tab ── */}
        <Tab eventKey="details" title="Details">
          {editing ? (
            <Card className="shadow-sm border-0 p-4">
              <VisitForm
                initialValues={{
                  ...selected,
                  visitDate: selected.visitDate ? selected.visitDate.slice(0, 10) : '',
                }}
                onSubmit={handleUpdate}
                onCancel={cancelEdit}
                isLoading={isLoading}
                error={null}
                pets={pets}
              />
            </Card>
          ) : (
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <dl className="row mb-0 detail-list">
                  <dt className="col-sm-4 text-muted fw-normal">Pet</dt>
                  <dd className="col-sm-8 fw-semibold">
                    {pets.length > 0 ? (
                      <Link to={`/pets/${selected.petId}`}>{petName()}</Link>
                    ) : (
                      petName()
                    )}
                  </dd>

                  <dt className="col-sm-4 text-muted fw-normal">Visit Date</dt>
                  <dd className="col-sm-8">
                    {selected.visitDate
                      ? new Date(selected.visitDate).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })
                      : '—'}
                  </dd>

                  <dt className="col-sm-4 text-muted fw-normal">Status</dt>
                  <dd className="col-sm-8">
                    <Badge bg={STATUS_BADGE[selected.status] ?? 'secondary'}>
                      {selected.status}
                    </Badge>
                  </dd>

                  <dt className="col-sm-4 text-muted fw-normal">Reason</dt>
                  <dd className="col-sm-8">{selected.reason || '—'}</dd>

                  <dt className="col-sm-4 text-muted fw-normal">Notes</dt>
                  <dd className="col-sm-8 mb-0">{selected.notes || '—'}</dd>
                </dl>

                <div className="d-flex gap-2 mt-4 flex-wrap">
                  <Button variant="primary" size="sm" onClick={startEdit}>
                    Edit Visit
                  </Button>
                  {isAdmin && (
                    <Button variant="outline-danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                      Delete Visit
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </Tab>

        {/* ── Diagnoses tab ── */}
        <Tab eventKey="diagnoses" title={`Diagnoses (${diagnoses.length})`}>
          <div className="d-flex justify-content-end mb-3">
            <Button variant="primary" size="sm" onClick={() => setShowDiagForm((v) => !v)}>
              {showDiagForm ? 'Cancel' : '+ Add Diagnosis'}
            </Button>
          </div>

          {showDiagForm && (
            <Card className="shadow-sm border-0 p-3 mb-3">
              <DiagnosisForm
                onSubmit={handleAddDiagnosis}
                onCancel={() => setShowDiagForm(false)}
                isLoading={isLoading}
                error={error}
              />
            </Card>
          )}

          {isLoading && !diagnoses.length && (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" size="sm" />
            </div>
          )}

          {!isLoading && diagnoses.length === 0 && (
            <p className="text-muted">No diagnoses recorded for this visit.</p>
          )}

          {diagnoses.length > 0 && (
            <ListGroup variant="flush" className="shadow-sm rounded">
              {diagnoses.map((d) => (
                <ListGroup.Item key={d.id} className="py-3 px-4">
                  <div className="fw-semibold mb-1">{d.description}</div>
                  {d.notes && <div className="text-muted small">{d.notes}</div>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>

        {/* ── Treatments tab ── */}
        <Tab eventKey="treatments" title={`Treatments (${treatments.length})`}>
          <div className="d-flex justify-content-end mb-3">
            <Button variant="primary" size="sm" onClick={() => setShowTreatForm((v) => !v)}>
              {showTreatForm ? 'Cancel' : '+ Add Treatment'}
            </Button>
          </div>

          {showTreatForm && (
            <Card className="shadow-sm border-0 p-3 mb-3">
              <TreatmentForm
                onSubmit={handleAddTreatment}
                onCancel={() => setShowTreatForm(false)}
                isLoading={isLoading}
                error={error}
              />
            </Card>
          )}

          {isLoading && !treatments.length && (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" size="sm" />
            </div>
          )}

          {!isLoading && treatments.length === 0 && (
            <p className="text-muted">No treatments recorded for this visit.</p>
          )}

          {treatments.length > 0 && (
            <ListGroup variant="flush" className="shadow-sm rounded">
              {treatments.map((t) => (
                <ListGroup.Item key={t.id} className="py-3 px-4">
                  <div className="fw-semibold mb-1">{t.name}</div>
                  {t.description && (
                    <div className="text-muted small mb-1">{t.description}</div>
                  )}
                  {t.notes && <div className="text-muted small">{t.notes}</div>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>
      </Tabs>

      {/* Delete confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Visit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this visit? This action cannot be undone.
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
