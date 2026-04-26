import { Container, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function PageLoadError({ message, backTo, backLabel = 'Back' }) {
  return (
    <Container className="py-4">
      <Alert variant="danger">
        {message || 'Something went wrong. Please try again.'}
      </Alert>
      {backTo && (
        <Button as={Link} to={backTo} variant="outline-secondary" size="sm">
          ← {backLabel}
        </Button>
      )}
    </Container>
  );
}
