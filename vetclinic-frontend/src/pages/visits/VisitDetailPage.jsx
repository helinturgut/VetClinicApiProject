import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Card, Button, Alert, Spinner, Badge,
  Tab, Tabs, ListGroup,
} from 'react-bootstrap';
import {
  fetchVisit, updateVisit, deleteVisit,
  fetchDiagnoses, addDiagnosis, updateDiagnosis, deleteDiagnosis,
  fetchTreatments, addTreatment, updateTreatment, deleteTreatment,
  clearSelected, clearError,
} from '../../store/slices/visitsSlice';
import { fetchPets } from '../../store/slices/petsSlice';
import { useAuth } from '../../hooks/useAuth';
import VisitForm from '../../components/visits/VisitForm';
import DiagnosisForm from '../../components/visits/DiagnosisForm';
import TreatmentForm from '../../components/visits/TreatmentForm';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageLoadError from '../../components/ui/PageLoadError';
import { STATUS_BADGE } from '../../constants/badges';

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
  const [editingDiagId, setEditingDiagId] = useState(null);
  const [deletingDiagId, setDeletingDiagId] = useState(null);
  const [editingTreatId, setEditingTreatId] = useState(null);
  const [deletingTreatId, setDeletingTreatId] = useState(null);

  useEffect(() => {
    dispatch(fetchVisit(id));
    dispatch(fetchDiagnoses(id));
    dispatch(fetchTreatments(id));
    dispatch(fetchPets());
    return () => dispatch(clearSelected());
  }, [dispatch, id]);

  const petName = () => {
    const pet = pets.find((p) => p.petId === selected?.petId);
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

  const handleUpdateDiagnosis = async (data) => {
    const result = await dispatch(updateDiagnosis({ visitId: id, diagnosisId: editingDiagId, data }));
    if (updateDiagnosis.fulfilled.match(result)) setEditingDiagId(null);
  };

  const handleDeleteDiagnosis = async () => {
    const result = await dispatch(deleteDiagnosis({ visitId: id, diagnosisId: deletingDiagId }));
    if (deleteDiagnosis.fulfilled.match(result)) setDeletingDiagId(null);
  };

  const handleAddTreatment = async (data) => {
    const result = await dispatch(addTreatment({ visitId: id, data }));
    if (addTreatment.fulfilled.match(result)) setShowTreatForm(false);
  };

  const handleUpdateTreatment = async (data) => {
    const result = await dispatch(updateTreatment({ visitId: id, treatmentId: editingTreatId, data }));
    if (updateTreatment.fulfilled.match(result)) setEditingTreatId(null);
  };

  const handleDeleteTreatment = async () => {
    const result = await dispatch(deleteTreatment({ visitId: id, treatmentId: deletingTreatId }));
    if (deleteTreatment.fulfilled.match(result)) setDeletingTreatId(null);
  };

  const toggleDiagForm = () => {
    dispatch(clearError());
    setEditingDiagId(null);
    setShowDiagForm((v) => !v);
  };

  const toggleTreatForm = () => {
    dispatch(clearError());
    setEditingTreatId(null);
    setShowTreatForm((v) => !v);
  };

  if (isLoading && !selected) return <LoadingSpinner />;

  if (!isLoading && error && !selected) {
    return <PageLoadError message={error} backTo="/visits" backLabel="Back to Visits" />;
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
            <Button variant="primary" size="sm" onClick={toggleDiagForm}>
              {showDiagForm ? 'Cancel' : '+ Add Diagnosis'}
            </Button>
          </div>

          {showDiagForm && (
            <Card className="shadow-sm border-0 p-3 mb-3">
              <DiagnosisForm
                onSubmit={handleAddDiagnosis}
                onCancel={toggleDiagForm}
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

          {!isLoading && diagnoses.length === 0 && !showDiagForm && (
            <p className="text-muted">No diagnoses recorded for this visit.</p>
          )}

          {diagnoses.length > 0 && (
            <ListGroup variant="flush" className="shadow-sm rounded">
              {diagnoses.map((d) => (
                <ListGroup.Item key={d.diagnosisId} className="py-3 px-4">
                  {editingDiagId === d.diagnosisId ? (
                    <DiagnosisForm
                      initialValues={{
                        diseaseName: d.diseaseName,
                        description: d.description ?? '',
                        severity: d.severity ?? '',
                      }}
                      onSubmit={handleUpdateDiagnosis}
                      onCancel={() => { dispatch(clearError()); setEditingDiagId(null); }}
                      isLoading={isLoading}
                      error={error}
                    />
                  ) : (
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="fw-semibold">{d.diseaseName}</span>
                          {d.severity && (
                            <span className="badge bg-secondary">{d.severity}</span>
                          )}
                        </div>
                        {d.description && <div className="text-muted small">{d.description}</div>}
                      </div>
                      <div className="d-flex gap-1 flex-shrink-0">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => { dispatch(clearError()); setShowDiagForm(false); setEditingDiagId(d.diagnosisId); }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setDeletingDiagId(d.diagnosisId)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>

        {/* ── Treatments tab ── */}
        <Tab eventKey="treatments" title={`Treatments (${treatments.length})`}>
          <div className="d-flex justify-content-end mb-3">
            <Button variant="primary" size="sm" onClick={toggleTreatForm}>
              {showTreatForm ? 'Cancel' : '+ Add Treatment'}
            </Button>
          </div>

          {showTreatForm && (
            <Card className="shadow-sm border-0 p-3 mb-3">
              <TreatmentForm
                onSubmit={handleAddTreatment}
                onCancel={toggleTreatForm}
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

          {!isLoading && treatments.length === 0 && !showTreatForm && (
            <p className="text-muted">No treatments recorded for this visit.</p>
          )}

          {treatments.length > 0 && (
            <ListGroup variant="flush" className="shadow-sm rounded">
              {treatments.map((t) => (
                <ListGroup.Item key={t.treatmentId} className="py-3 px-4">
                  {editingTreatId === t.treatmentId ? (
                    <TreatmentForm
                      initialValues={{
                        treatmentName: t.treatmentName,
                        medication: t.medication ?? '',
                        dosage: t.dosage ?? '',
                        instructions: t.instructions ?? '',
                        cost: t.cost ?? 0,
                      }}
                      onSubmit={handleUpdateTreatment}
                      onCancel={() => { dispatch(clearError()); setEditingTreatId(null); }}
                      isLoading={isLoading}
                      error={error}
                    />
                  ) : (
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="fw-semibold">{t.treatmentName}</span>
                          {t.cost > 0 && (
                            <span className="text-muted small">£{Number(t.cost).toFixed(2)}</span>
                          )}
                        </div>
                        {(t.medication || t.dosage) && (
                          <div className="text-muted small mb-1">
                            {[t.medication, t.dosage].filter(Boolean).join(' — ')}
                          </div>
                        )}
                        {t.instructions && <div className="text-muted small">{t.instructions}</div>}
                      </div>
                      <div className="d-flex gap-1 flex-shrink-0">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => { dispatch(clearError()); setShowTreatForm(false); setEditingTreatId(t.treatmentId); }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setDeletingTreatId(t.treatmentId)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>
      </Tabs>

      <ConfirmModal
        show={showDeleteModal}
        title="Delete Visit"
        body="Are you sure you want to delete this visit? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isLoading}
      />

      <ConfirmModal
        show={!!deletingDiagId}
        title="Delete Diagnosis"
        body="Are you sure you want to delete this diagnosis?"
        onConfirm={handleDeleteDiagnosis}
        onCancel={() => setDeletingDiagId(null)}
        isLoading={isLoading}
      />

      <ConfirmModal
        show={!!deletingTreatId}
        title="Delete Treatment"
        body="Are you sure you want to delete this treatment?"
        onConfirm={handleDeleteTreatment}
        onCancel={() => setDeletingTreatId(null)}
        isLoading={isLoading}
      />
    </Container>
  );
}
