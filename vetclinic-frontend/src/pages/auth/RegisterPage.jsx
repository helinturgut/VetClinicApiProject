import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { register, clearError } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.png';
import authBg from '../../assets/auth-bg.png';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useAuth();

  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [validated, setValidated] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      setValidated(true);
      return;
    }
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) setSuccess(true);
  };

  if (success) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center min-vh-100 auth-bg-container"
        style={{ backgroundImage: `url(${authBg})` }}
      >
        <Row className="w-100 justify-content-center">
          <Col xs={12} sm={9} md={6} lg={4}>
            <Alert variant="success" className="shadow-sm">
              <Alert.Heading>Registration Successful</Alert.Heading>
              <p className="mb-3">
                Your account is pending admin approval. You will receive an email once it has been approved.
              </p>
              <Link to="/login" className="btn btn-outline-success btn-sm">
                Back to Sign In
              </Link>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center min-vh-100 auth-bg-container"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={9} md={6} lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-2">
                <img src={logo} alt="VetClinic" style={{ height: 90, objectFit: 'contain' }} />
              </div>
              <h4 className="fw-bold text-center mb-1">Create Account</h4>
              <p className="text-muted text-center small mb-4">
                Accounts require admin approval before access is granted.
              </p>

              {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Dr. Jane Smith"
                    autoComplete="name"
                  />
                  <Form.Control.Feedback type="invalid">
                    Full name is required.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid email address.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      placeholder="Min. 8 characters, upper & lowercase + digit"
                      autoComplete="new-password"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁'}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      Password must be at least 8 characters.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={isLoading}>
                  {isLoading ? 'Registering...' : 'Register'}
                </Button>
              </Form>

              <p className="mt-3 text-center text-muted small">
                Already have an account?{' '}
                <Link to="/login">Sign In</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
