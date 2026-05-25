import React, { useState } from 'react';
import { Container, Row, Col, Card, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="vh-100">
      <Container className="py-5 h-100">
        <Row className="d-flex justify-content-center align-items-center h-100">
          <Col xl={6}>
            <Card className="bg-light shadow mb-5 bg-white rounded">
              <Card.Body className="p-4 p-lg-5 text-black">
                <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: '1px' }}>Forgot Password</h5>
                <form>
                  <div className="form-outline mb-4">
                    <h6>Email</h6>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="pt-1 mb-4">
                    <button
                      className="btn btn-lg btn-block"
                      style={{ backgroundColor: '#0e2238', color: '#ffffff' }}
                      type="submit"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Toast
          show={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body>Password reset link sent successfully.</Toast.Body>
        </Toast>
        <Toast
          show={showErrorToast}
          onClose={() => setShowErrorToast(false)}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body>Failed to send reset link. Please try again.</Toast.Body>
        </Toast>
      </Container>
    </section>
  );
};

export default ForgotPassword;
