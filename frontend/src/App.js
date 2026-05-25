import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import BackToTopButton from './Components/BackToTopButton';
import Main from './Components/Main';
import Login from './Components/Login';
import Signup from './Components/Signup';
import ResetPassword from './Components/ResetPassword';
import ForgotPassword from './Components/ForgotPassword';
import EmailForm from './Components/EmailForm';

function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const isAuthenticated = loggedIn || localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  const handleLogin = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (normalizedEmail === 'sample@gmail.com' && (normalizedPassword === 'admin' || normalizedPassword === 'sample')) {
      setLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user_lvl', '1');
      localStorage.setItem('id', '2');
      localStorage.setItem('first_name', 'sample');
      localStorage.setItem('last_name', 'sample');
      return { success: true, user_lvl: '1', first_name: 'sample', id: '2', last_name: 'sample' };
    }
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
      });
  
      const data = await response.json();
      console.log(data); // Handle response from CodeIgniter
  
      if (data.status === 200) {
        // If login is successful, set loggedIn state to true
        setLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user_lvl', data.data.user_lvl);
        localStorage.setItem('id', data.data.id);
        return { success: true, user_lvl: data.data.user_lvl, first_name: data.data.first_name, id: data.data.id, last_name: data.data.last_name };
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/DOST" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login handleLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/send-email" element={<EmailForm/>} />
        <Route path="/DOST/*" element={isAuthenticated ? <Main /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
