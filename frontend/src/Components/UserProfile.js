import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Toast } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EditUserProfile from './EditUserProfile';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Fetch user information from the backend using the user ID stored in localStorage
    const userId = localStorage.getItem('id');
    if (userId) {
      fetchUserProfile(userId);
    }
  }, []);

  const handleEditModalOpen = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/Accounts/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow bg-light rounded">
            <Card.Body>
              <h2 className="text-center mb-4">User Profile</h2>
              {user && (
                <div>
                  <p><strong>First Name:</strong> {user.first_name}</p>
                  <p><strong>Last Name:</strong>  {user.last_name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Password:</strong> {user.password}</p>
                </div>
              )}
              <button className="btn btn-primary" onClick={() => handleEditModalOpen(user)}>Edit Profile</button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <EditUserProfile 
        isEditModalOpen={isEditModalOpen} 
        closeModal={() => setIsEditModalOpen(false)} 
        user={selectedUser} 
        refresh={() => fetchUserProfile(localStorage.getItem('id'))} 
      />
    </Container>
  );
};

export default UserProfile;
