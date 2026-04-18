import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', address: '' };


export default function OwnerForm({ initialValues, onSubmit, onCancel, isLoading, error }) {
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
          <Form.Group controlId="ownerFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              required
              placeholder="Jane"
            />
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group controlId="ownerLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              required
              placeholder="Doe"
            />
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group controlId="ownerEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              required
              placeholder="jane@example.com"
            />
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group controlId="ownerPhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              name="phone"
              value={values.phone}
              onChange={handleChange}
              required
              placeholder="+44 7700 900000"
            />
          </Form.Group>
        </Col>
        <Col sm={12}>
          <Form.Group controlId="ownerAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control
              name="address"
              value={values.address}
              onChange={handleChange}
              required
              placeholder="123 Main St, London"
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
