import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ConfigProvider } from 'antd';
import store from './store';
import { getCurrentUser } from './store/slices/authSlice';
import { USER_ROLES } from './constants';

// Layout Components
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import GuestLayout from './components/layout/GuestLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PendingApprovalPage from './pages/auth/PendingApprovalPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

// Public Pages
import HomePage from './pages/public/HomePage';
import CoursesPage from './pages/public/CoursesPage';
import ServicesPage from './pages/public/ServicesPage';
import TestPage from './pages/public/TestPage';
import ResearcherProfilePage from './pages/public/ResearcherProfilePage';
import LabDetailPage from './pages/public/LabDetailPage';
import AnnouncementDetailPage from './pages/public/AnnouncementDetailPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';

// Ant Design theme configuration
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    colorBgContainer: '#ffffff',
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      headerBg: '#ffffff',
    },
  },
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is logged in and get current user data
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, user]);

  return (
    <Router>
      <Routes>
        {/* Auth routes (no layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Public routes with guest layout */}
        <Route element={
          <ProtectedRoute allowGuest>
            <GuestLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/researchers/:id" element={<ResearcherProfilePage />} />
          <Route path="/labs/:id" element={<LabDetailPage />} />
          <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
          <Route path="/test" element={<TestPage />} />
        </Route>

        {/* Authenticated routes with main layout */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Admin only routes */}
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <div>User Management - Coming Soon</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <div>Analytics - Coming Soon</div>
              </ProtectedRoute>
            }
          />

          {/* Module routes - will be implemented in later phases */}
          <Route path="research" element={<div>Research Module - Coming Soon</div>} />
          <Route path="organization" element={<div>Organization Module - Coming Soon</div>} />
          <Route path="training" element={<div>Training Module - Coming Soon</div>} />
          <Route path="services" element={<div>Services Module - Coming Soon</div>} />
          <Route path="content" element={<div>Content Module - Coming Soon</div>} />
          <Route path="notifications" element={<div>Notifications - Coming Soon</div>} />
          <Route path="settings" element={<div>Settings Page - Coming Soon</div>} />
        </Route>

        {/* Catch all route - redirect unknown paths */}
        <Route
          path="*"
          element={
            isAuthenticated ?
              <Navigate to="/app/dashboard" replace /> :
              <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <AppContent />
      </ConfigProvider>
    </Provider>
  );
}

export default App;
