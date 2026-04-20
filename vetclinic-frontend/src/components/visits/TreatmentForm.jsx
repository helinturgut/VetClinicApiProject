import { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

const EMPTY = { name: '', description: '', notes: '' };

export default function TreatmentForm({ onSubmit, onCancel, isLoading, error }) {
  const [values, setValues] = useState(EMPTY);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
    setValues(EMPTY);
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      <Row className="g-3">
        <Col sm={12}>
          <Form.Group controlId="treatmentName">
            <Form.Label>Treatment Name</Form.Label>
            <Form.Control
              name="name"
              value={values.name}
              onChange={handleChange}
              required
              placeholder="e.g. Antibiotics course"
            />
          </Form.Group>
        </Col>

        <Col sm={12}>
          <Form.Group controlId="treatmentDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={values.description}
              onChange={handleChange}
              required
              placeholder="Describe the treatment…"
            />
          </Form.Group>
        </Col>

        <Col sm={12}>
          <Form.Group controlId="treatmentNotes">
            <Form.Label>Notes <span className="text-muted fw-normal">(optional)</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              value={values.notes}
              onChange={handleChange}
              placeholder="Dosage, frequency, duration…"
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex gap-2 mt-3">
        <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
          {isLoading ? 'Adding…' : 'Add Treatment'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline-secondary" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </Form>
  );
}
