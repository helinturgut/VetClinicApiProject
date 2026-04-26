import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import authService from '../../services/authService';
import logo from '../../assets/logo.png';
import authBg from '../../assets/auth-bg.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      setValidated(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
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
              <h4 className="fw-bold text-center mb-1">Forgot Password</h4>
              <p className="text-muted text-center small mb-4">
                Enter your email and we'll send you a reset link.
              </p>

              {submitted ? (
                <Alert variant="success">
                  If that email is registered, a password reset link has been sent. Please check your inbox.
                </Alert>
              ) : (
                <>
                  {error && <Alert variant="danger">{error}</Alert>}

                  <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid email address.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button type="submit" variant="primary" className="w-100" disabled={isLoading}>
                      {isLoading ? 'Sending…' : 'Send Reset Link'}
                    </Button>
                  </Form>
                </>
              )}

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
