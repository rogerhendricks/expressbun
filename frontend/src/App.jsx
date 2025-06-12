import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/protectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Layout from './components/Layout';
import DevicesPage from './pages/devices/DevicesPage'
import LeadsPage from './pages/leads/LeadsPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/profile" replace />} />
                            {/* Device Route */}
                            <Route 
                path="/devices"
                element={
                  <ProtectedRoute>
                    <DevicesPage />
                  </ProtectedRoute>
                }
              />
              {/* Lead Route */}
              <Route 
                path="/leads"
                element={
                  <ProtectedRoute>
                    <LeadsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;