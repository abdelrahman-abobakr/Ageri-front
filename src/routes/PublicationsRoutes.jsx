// routes/PublicationsRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PublicationsListPage from '../pages/research/PublicationsPage';
import PublicationDetailPage from '../pages/research/PublicationDetailPage';
import PublicationForm from '../pages/research/PublicationForm';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null, adminOnly = false }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/app/research/publications" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole && !user.is_admin) {
    return <Navigate to="/app/research/publications" replace />;
  }
  
  return children;
};

// Publications Routes Component
const PublicationsRoutes = () => {
  return (
    <Routes>
      {/* Publications List */}
      <Route 
        path="/"
        element={
          <ProtectedRoute>
            <PublicationsListPage />
          </ProtectedRoute>
        }
      />
      
      {/* Create New Publication */}
      <Route 
        path="/new" 
        element={
          <ProtectedRoute requiredRole="researcher">
            <PublicationForm />
          </ProtectedRoute>
        }
      />
      
      {/* Publication Detail */}
      <Route 
        path="/:id" 
        element={
          <ProtectedRoute>
            <PublicationDetailPage />
          </ProtectedRoute>
        }
      />
      
      {/* Edit Publication */}
      <Route 
        path="/:id/edit" 
        element={
          <ProtectedRoute>
            <PublicationForm />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute adminOnly={true}>
            <Routes>
              <Route path="pending" element={<PublicationsListPage adminView="pending" />} />
              <Route path="approved" element={<PublicationsListPage adminView="approved" />} />
              <Route path="rejected" element={<PublicationsListPage adminView="rejected" />} />
              <Route path="statistics" element={<PublicationsListPage adminView="statistics" />} />
            </Routes>
          </ProtectedRoute>
        }
      />
      
      {/* Redirect any unmatched routes */}
      <Route path="*" element={<Navigate to="/app/research/publications" replace />} />
    </Routes>
  );
};

export default PublicationsRoutes;
