import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Guinea Pig', 'Fish', 'Reptile', 'Other'];

const GENDER_OPTIONS = ['Male', 'Female'];

const EMPTY = { name: '', species: '', breed: '', birthDate: '', gender: '', weight: '', ownerId: '' };
const today = new Date().toISOString().slice(0, 10);

const isKnownSpecies = (s) => SPECIES_OPTIONS.includes(s);

const toDropdownValue = (species) =>
  !species || isKnownSpecies(species) ? (species ?? '') : 'Other';

const toCustomValue = (species) =>
  species && !isKnownSpecies(species) ? species : '';

const normalizeInitial = (init) => {
  if (!init) return EMPTY;
  return { ...init, species: toDropdownValue(init.species ?? '') };
};

export default function PetForm({ initialValues, onSubmit, onCancel, isLoading, error, owners = [] }) {
  const [values, setValues] = useState(normalizeInitial(initialValues));
  const [customSpecies, setCustomSpecies] = useState(toCustomValue(initialValues?.species ?? ''));

  useEffect(() => {
    setValues(normalizeInitial(initialValues));
    setCustomSpecies(toCustomValue(initialValues?.species ?? ''));
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (name === 'species' && value !== 'Other') setCustomSpecies('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalSpecies = values.species === 'Other' ? customSpecies.trim() : values.species;
    onSubmit({
      ...values,
      species: finalSpecies,
      weight: values.weight !== '' ? Number(values.weight) : null,
      gender: values.gender || null,
    });
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
              {SPECIES_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {values.species === 'Other' && (
          <Col sm={6}>
            <Form.Group controlId="petCustomSpecies">
              <Form.Label>Specify Species</Form.Label>
              <Form.Control
                value={customSpecies}
                onChange={(e) => setCustomSpecies(e.target.value)}
                required
                placeholder="e.g. Ferret, Turtle…"
                maxLength={50}
              />
            </Form.Group>
          </Col>
        )}

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
              lang="en"
              name="birthDate"
              value={values.birthDate ? values.birthDate.slice(0, 10) : ''}
              onChange={handleChange}
              required
              max={today}
            />
          </Form.Group>
        </Col>

        <Col sm={6}>
          <Form.Group controlId="petGender">
            <Form.Label>Gender</Form.Label>
            <Form.Select name="gender" value={values.gender} onChange={handleChange}>
              <option value="">Select…</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col sm={4}>
          <Form.Group controlId="petWeight">
            <Form.Label>Weight (kg)</Form.Label>
            <Form.Control
              type="number"
              name="weight"
              value={values.weight}
              onChange={handleChange}
              min={0}
              step="0.1"
              placeholder="0.0"
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
                  <option key={o.ownerId} value={o.ownerId}>
                    {o.fullName}
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
