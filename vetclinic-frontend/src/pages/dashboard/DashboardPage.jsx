import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

const MODULES = [
  {
    title: 'Owners',
    description: 'Manage pet owner records',
    to: '/owners',
    roles: ['Admin', 'Veterinarian', 'Receptionist'],
  },
  {
    title: 'Pets',
    description: 'View and manage patient pets',
    to: '/pets',
    roles: ['Admin', 'Veterinarian', 'Receptionist'],
  },
  {
    title: 'Visits',
    description: 'Clinical visit records',
    to: '/visits',
    roles: ['Admin', 'Veterinarian'],
  },
  {
    title: 'Admin Panel',
    description: 'Approve veterinarian accounts',
    to: '/admin/veterinarians',
    roles: ['Admin'],
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const visibleModules = MODULES.filter((m) => m.roles.includes(user?.role));

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Welcome, {user?.fullName}</h3>
        <p className="text-muted mb-0">
          Logged in as <strong>{user?.role}</strong> &mdash; {user?.email}
        </p>
      </div>

      <Row xs={1} sm={2} lg={4} className="g-3">
        {visibleModules.map(({ title, description, to }) => (
          <Col key={to}>
            <Card
              as={Link}
              to={to}
              className="h-100 text-decoration-none text-dark shadow-sm border-0 card-hover"
            >
              <Card.Body className="py-4 text-center">
                <Card.Title className="fw-semibold">{title}</Card.Title>
                <Card.Text className="text-muted small">{description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
