import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import dashboardBg from '../../assets/dashboard-bg.png';

const MODULES = [
  {
    title: 'Owners',
    description: 'Manage pet owner records',
    to: '/owners',
    icon: '👤',
    roles: ['Admin', 'Veterinarian', 'Receptionist'],
  },
  {
    title: 'Pets',
    description: 'View and manage patient pets',
    to: '/pets',
    icon: '🐾',
    roles: ['Admin', 'Veterinarian', 'Receptionist'],
  },
  {
    title: 'Visits',
    description: 'Clinical visit records',
    to: '/visits',
    icon: '🩺',
    roles: ['Admin', 'Veterinarian'],
  },
  {
    title: 'Admin Panel',
    description: 'Approve veterinarian accounts',
    to: '/admin/veterinarians',
    icon: '⚙️',
    roles: ['Admin'],
  },
];

const ROLE_BADGE = {
  Admin: 'danger',
  Veterinarian: 'primary',
  Receptionist: 'success',
};

export default function DashboardPage() {
  const { user } = useAuth();

  const visibleModules = MODULES.filter((m) => m.roles.includes(user?.role));

  return (
    <div
      className="dashboard-bg"
      style={{ backgroundImage: `url(${dashboardBg})` }}
    >
    <Container className="py-4">
      {/* Welcome banner */}
      <div className="p-4 mb-4 bg-white rounded shadow-sm d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-3">
        <div>
          <h3 className="fw-bold mb-1">Welcome back, {user?.fullName}!</h3>
          <p className="text-muted mb-0 small">{user?.email}</p>
        </div>
        <Badge bg={ROLE_BADGE[user?.role] ?? 'secondary'} className="fs-6 px-3 py-2 align-self-start align-self-sm-center">
          {user?.role}
        </Badge>
      </div>

      <h6 className="text-muted text-uppercase fw-semibold mb-3" style={{ letterSpacing: '0.05em' }}>
        Quick Access
      </h6>

      <Row xs={1} sm={2} lg={4} className="g-3">
        {visibleModules.map(({ title, description, to, icon }) => (
          <Col key={to}>
            <Card
              as={Link}
              to={to}
              className="h-100 text-decoration-none text-dark shadow-sm border-0 card-hover"
            >
              <Card.Body className="py-4 text-center">
                <span className="dash-icon">{icon}</span>
                <Card.Title className="fw-semibold mb-1">{title}</Card.Title>
                <Card.Text className="text-muted small mb-0">{description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
    </div>
  );
}
