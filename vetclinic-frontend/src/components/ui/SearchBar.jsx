import { Form, Button, InputGroup } from 'react-bootstrap';

export default function SearchBar({ value, onChange, placeholder = 'Search…', style }) {
  return (
    <InputGroup style={style}>
      <Form.Control
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <Button variant="outline-secondary" onClick={() => onChange('')}>
          ✕
        </Button>
      )}
    </InputGroup>
  );
}
