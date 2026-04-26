import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

const STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

const EMPTY = { petId: '', visitDate: '', reason: '', notes: '', status: 'Scheduled' };

export default function VisitForm({ initialValues, onSubmit, onCancel, isLoading, error, pets = [] }) {
  const [values, setValues] = useState(initialValues ?? EMPTY);

  useEffect(() => {
    setValues(initialValues ?? EMPTY);
  }, [initialValues]);

  const today = new Date().toISOString().slice(0, 10);

  const dateMin = values.status === 'Scheduled' ? today : undefined;
  const dateMax = values.status === 'Completed' ? today : undefined;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => {
      const updated = { ...v, [name]: value };
      if (name === 'status') {
        const d = v.visitDate ? v.visitDate.slice(0, 10) : '';
        if (value === 'Scheduled' && d && d < today) updated.visitDate = '';
        if (value === 'Completed' && d && d > today) updated.visitDate = '';
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      <Row className="g-3">
        {pets.length > 0 && (
          <Col sm={12}>
            <Form.Group controlId="visitPetId">
              <Form.Label>Pet</Form.Label>
              <Form.Select name="petId" value={values.petId} onChange={handleChange} required>
                <option value="">Select pet…</option>
                {pets.map((p) => (
                  <option key={p.petId} value={p.petId}>{p.name} ({p.species})</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        <Col sm={6}>
          <Form.Group controlId="visitDate">
            <Form.Label>Visit Date</Form.Label>
            <Form.Control
              type="date"
              lang="en"
              name="visitDate"
              value={values.visitDate ? values.visitDate.slice(0, 10) : ''}
              onChange={handleChange}
              min={dateMin}
              max={dateMax}
              required
            />
          </Form.Group>
        </Col>

        <Col sm={6}>
          <Form.Group controlId="visitStatus">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={values.status} onChange={handleChange} required>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col sm={12}>
          <Form.Group controlId="visitReason">
            <Form.Label>Reason</Form.Label>
            <Form.Control
              name="reason"
              value={values.reason}
              onChange={handleChange}
              required
              placeholder="Annual checkup, vaccination, illness…"
            />
          </Form.Group>
        </Col>

        <Col sm={12}>
          <Form.Group controlId="visitNotes">
            <Form.Label>Notes <span className="text-muted fw-normal">(optional)</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={values.notes}
              onChange={handleChange}
              placeholder="Additional observations…"
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex gap-2 mt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </Form>
  );
}
