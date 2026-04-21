import { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

const EMPTY = { name: '', description: '', notes: '' };

export default function TreatmentForm({ onSubmit, onCancel, isLoading, error }) {
  const [values, setValues] = useState(EMPTY);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (validationErrors[name] && value.trim()) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!values.name.trim()) errors.name = 'Treatment name is required.';
    if (!values.description.trim()) errors.description = 'Description is required.';
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    onSubmit(values);
    setValues(EMPTY);
    setValidationErrors({});
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
              placeholder="e.g. Antibiotics course"
              isInvalid={!!validationErrors.name}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.name}
            </Form.Control.Feedback>
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
              placeholder="Describe the treatment…"
              isInvalid={!!validationErrors.description}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.description}
            </Form.Control.Feedback>
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
