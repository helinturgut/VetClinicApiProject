import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

const EMPTY = { treatmentName: '', medication: '', dosage: '', instructions: '', cost: 0 };

export default function TreatmentForm({ initialValues, onSubmit, onCancel, isLoading, error }) {
  const [values, setValues] = useState(initialValues ?? EMPTY);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setValues(initialValues ?? EMPTY);
    setValidationErrors({});
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: name === 'cost' ? Number(value) : value }));
    if (validationErrors[name] && value.trim()) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!values.treatmentName.trim()) errors.treatmentName = 'Treatment name is required.';
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
        <Col sm={8}>
          <Form.Group controlId="treatmentName">
            <Form.Label>Treatment Name</Form.Label>
            <Form.Control
              name="treatmentName"
              value={values.treatmentName}
              onChange={handleChange}
              placeholder="e.g. Antibiotics course"
              isInvalid={!!validationErrors.treatmentName}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.treatmentName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col sm={4}>
          <Form.Group controlId="treatmentCost">
            <Form.Label>Cost (£)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              name="cost"
              value={values.cost}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>

        <Col sm={6}>
          <Form.Group controlId="treatmentMedication">
            <Form.Label>Medication <span className="text-muted fw-normal">(optional)</span></Form.Label>
            <Form.Control
              name="medication"
              value={values.medication}
              onChange={handleChange}
              placeholder="e.g. Amoxicillin"
            />
          </Form.Group>
        </Col>

        <Col sm={6}>
          <Form.Group controlId="treatmentDosage">
            <Form.Label>Dosage <span className="text-muted fw-normal">(optional)</span></Form.Label>
            <Form.Control
              name="dosage"
              value={values.dosage}
              onChange={handleChange}
              placeholder="e.g. 250mg twice daily"
            />
          </Form.Group>
        </Col>

        <Col sm={12}>
          <Form.Group controlId="treatmentInstructions">
            <Form.Label>Instructions <span className="text-muted fw-normal">(optional)</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="instructions"
              value={values.instructions}
              onChange={handleChange}
              placeholder="Administration instructions, duration…"
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex gap-2 mt-3">
        <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
          {isLoading ? 'Saving…' : initialValues ? 'Update Treatment' : 'Add Treatment'}
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
