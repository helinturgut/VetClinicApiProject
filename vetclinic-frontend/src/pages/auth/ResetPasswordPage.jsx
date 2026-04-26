import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import authService from '../../services/authService';
import logo from '../../assets/logo.png';
import authBg from '../../assets/auth-bg.png';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!email || !token) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="danger">
          Invalid or missing reset link. Please request a new one.{' '}
          <Link to="/forgot-password">Forgot password</Link>
        </Alert>
      </Container>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    if (!e.currentTarget.checkValidity()) return;
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email, token, password);
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.title ||
        'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              <h4 className="fw-bold text-center mb-1">Reset Password</h4>
              <p className="text-muted text-center small mb-4">Choose a new password for your account.</p>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
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

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please confirm your password.
                  </Form.Control.Feedback>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={isLoading}>
                  {isLoading ? 'Resetting…' : 'Reset Password'}
                </Button>
              </Form>

              <p className="mt-3 text-center text-muted small">
                <Link to="/login">← Back to Sign In</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
