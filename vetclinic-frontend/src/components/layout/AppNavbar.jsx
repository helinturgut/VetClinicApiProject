import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/slices/authSlice';
import logo from '../../assets/logo.png';

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
    <Navbar bg="white" variant="light" expand="lg" sticky="top" className="border-bottom shadow-sm">
      <Container>
        <Navbar.Brand as={NavLink} to="/dashboard" className="d-flex align-items-center gap-2">
          <img src={logo} alt="VetClinic" height={36} style={{ objectFit: 'contain' }} />
          VetClinic
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={NavLink} to="/owners">Owners</Nav.Link>
            <Nav.Link as={NavLink} to="/pets">Pets</Nav.Link>
            {(isAdmin || isVet) && (
              <Nav.Link as={NavLink} to="/visits">Visits</Nav.Link>
            )}
            {isAdmin && (
              <Nav.Link as={NavLink} to="/admin/veterinarians">Admin</Nav.Link>
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
