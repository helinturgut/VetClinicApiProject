import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const EMPTY = { description: '', notes: '' };

export default function DiagnosisForm({ onSubmit, onCancel, isLoading, error }) {
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

      <Form.Group controlId="diagDescription" className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          name="description"
          value={values.description}
          onChange={handleChange}
          required
          placeholder="e.g. Respiratory infection"
        />
      </Form.Group>

      <Form.Group controlId="diagNotes" className="mb-3">
        <Form.Label>Notes <span className="text-muted fw-normal">(optional)</span></Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="notes"
          value={values.notes}
          onChange={handleChange}
          placeholder="Additional details…"
        />
      </Form.Group>

      <div className="d-flex gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
          {isLoading ? 'Adding…' : 'Add Diagnosis'}
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
