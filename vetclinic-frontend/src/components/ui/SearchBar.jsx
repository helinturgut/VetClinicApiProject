import { Form, Button, InputGroup } from 'react-bootstrap';

export default function SearchBar({ value, onChange, placeholder = 'Search…', className = 'search-bar-wrap' }) {
  return (
    <InputGroup className={className}>
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
