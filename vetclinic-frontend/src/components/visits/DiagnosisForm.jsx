import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

const EMPTY = { diseaseName: '', description: '', severity: '' };

const SEVERITIES = ['', 'Low', 'Moderate', 'High', 'Critical'];

export default function DiagnosisForm({ initialValues, onSubmit, onCancel, isLoading, error }) {
  const [values, setValues] = useState(initialValues ?? EMPTY);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setValues(initialValues ?? EMPTY);
    setValidationErrors({});
  }, [initialValues]);

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
    if (!values.diseaseName.trim()) errors.diseaseName = 'Disease Name is required.';
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
          <Form.Group controlId="diagDiseaseName">
            <Form.Label>Disease Name</Form.Label>
            <Form.Control
              name="diseaseName"
              value={values.diseaseName}
              onChange={handleChange}
              placeholder="e.g. Respiratory infection"
              isInvalid={!!validationErrors.diseaseName}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.diseaseName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col sm={8}>
          <Form.Group controlId="diagDescription">
            <Form.Label>Description <span className="text-muted fw-normal">(optional)</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={values.description}
              onChange={handleChange}
              placeholder="Additional details about the diagnosis…"
            />
          </Form.Group>
        </Col>

        <Col sm={4}>
          <Form.Group controlId="diagSeverity">
            <Form.Label>Severity <span className="text-muted fw-normal">(optional)</span></Form.Label>
            <Form.Select name="severity" value={values.severity} onChange={handleChange}>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s || '— None —'}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex gap-2 mt-3">
        <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
          {isLoading ? 'Saving…' : initialValues ? 'Update Diagnosis' : 'Add Diagnosis'}
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
