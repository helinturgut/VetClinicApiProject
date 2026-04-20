import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

const SPECIES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Guinea Pig', 'Fish', 'Reptile', 'Other'];

const EMPTY = { name: '', species: '', breed: '', birthDate: '', ownerId: '' };


export default function PetForm({ initialValues, onSubmit, onCancel, isLoading, error, owners = [] }) {
  const [values, setValues] = useState(initialValues ?? EMPTY);

  useEffect(() => {
    setValues(initialValues ?? EMPTY);
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      <Row className="g-3">
        <Col sm={6}>
          <Form.Group controlId="petName">
            <Form.Label>Pet Name</Form.Label>
            <Form.Control
              name="name"
              value={values.name}
              onChange={handleChange}
              required
              placeholder="Buddy"
            />
          </Form.Group>
        </Col>

        <Col sm={6}>
          <Form.Group controlId="petSpecies">
            <Form.Label>Species</Form.Label>
            <Form.Select name="species" value={values.species} onChange={handleChange} required>
              <option value="">Select species…</option>
              {SPECIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col sm={6}>
          <Form.Group controlId="petBreed">
            <Form.Label>Breed</Form.Label>
            <Form.Control
              name="breed"
              value={values.breed}
              onChange={handleChange}
              placeholder="Labrador"
            />
          </Form.Group>
        </Col>

        <Col sm={6}>
          <Form.Group controlId="petBirthDate">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              name="birthDate"
              value={values.birthDate ? values.birthDate.slice(0, 10) : ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>

        {owners.length > 0 && (
          <Col sm={12}>
            <Form.Group controlId="petOwnerId">
              <Form.Label>Owner</Form.Label>
              <Form.Select name="ownerId" value={values.ownerId} onChange={handleChange} required>
                <option value="">Select owner…</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.firstName} {o.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}
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
