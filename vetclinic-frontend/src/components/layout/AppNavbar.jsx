import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/slices/authSlice';

const ROLE_BADGE_VARIANT = {
  Admin: 'danger',
  Veterinarian: 'primary',
  Receptionist: 'success',
};

export default function AppNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAdmin, isVet } = useAuth();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          VetClinic
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/owners">Owners</Nav.Link>
            <Nav.Link as={Link} to="/pets">Pets</Nav.Link>
            {(isAdmin || isVet) && (
              <Nav.Link as={Link} to="/visits">Visits</Nav.Link>
            )}
            {isAdmin && (
              <Nav.Link as={Link} to="/admin/veterinarians">Admin</Nav.Link>
            )}
          </Nav>
          <Nav>
            <NavDropdown
              title={
                <span>
                  {user?.fullName}{' '}
                  <Badge bg={ROLE_BADGE_VARIANT[user?.role] ?? 'secondary'}>
                    {user?.role}
                  </Badge>
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item disabled className="text-muted small">
                {user?.email}
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Sign Out</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
