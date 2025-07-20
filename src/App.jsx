import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ConfigProvider } from 'antd';
import { useTranslation } from 'react-i18next';
import arEG from 'antd/locale/ar_EG';
import enUS from 'antd/locale/en_US';
import store from './store';
import { getCurrentUser } from './store/slices/authSlice';
import { USER_ROLES } from './constants';
import './i18n';
import './styles/rtl.css';

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
import AnnouncementsPage from './pages/public/AnnouncementsPage';
import PostDetailPage from './pages/public/PostDetailPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';

// Admin Pages
import UserManagementPage from './pages/admin/UserManagementPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import ContentManagementPage from './pages/admin/ContentManagementPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
import ResearchManagementPage from './pages/admin/ResearchManagementPage';
import ServicesManagementPage from './pages/admin/ServicesManagementPage';
import TrainingManagementPage from './pages/admin/TrainingManagementPage';
import OrganizationManagementPage from './pages/admin/OrganizationManagementPage';
import NotificationsManagementPage from './pages/admin/NotificationsManagementPage';

// Import PublicationDetailPage to fix the 'not defined' error
import PublicationDetailPage from './pages/research/PublicationDetailPage.jsx';
import PublicationsPage from './pages/research/PublicationsPage.jsx';
import PublicationForm from './pages/research/PublicationForm.jsx';

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
  const { i18n } = useTranslation();

  useEffect(() => {
    // Check if user is logged in and get current user data
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Get Ant Design locale based on current language
  const getAntdLocale = () => {
    return i18n.language === 'ar' ? arEG : enUS;
  };

  return (
    <ConfigProvider theme={theme} locale={getAntdLocale()}>
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
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/researchers/:id" element={<ResearcherProfilePage />} />
          <Route path="/labs/:id" element={<LabDetailPage />} />
          <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
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
          <Route path="research/publications" element={<ProtectedRoute requiredPermission="VIEW_PUBLICATIONS"><PublicationsPage /></ProtectedRoute>} />
          <Route path="research/publications/new" element={<ProtectedRoute requiredPermission="SUBMIT_PUBLICATIONS"><PublicationForm /></ProtectedRoute>} />
          <Route path="research/publications/:id" element={<ProtectedRoute requiredPermission="VIEW_PUBLICATIONS"><PublicationDetailPage /></ProtectedRoute>} />
          <Route path="research/publications/:id/edit" element={<ProtectedRoute requiredPermission="SUBMIT_PUBLICATIONS"><PublicationForm isEdit={true} /></ProtectedRoute>} />
          {/* Home page for authenticated users */}
          <Route path="home" element={<HomePage />} />

          {/* Admin only routes */}
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Module routes - now fully implemented */}
          <Route
            path="research"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <ResearchManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="organization"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <OrganizationManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="training"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <TrainingManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="services"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <ServicesManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="content"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <ContentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <NotificationsManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <SystemSettingsPage />
              </ProtectedRoute>
            }
          />
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
    </ConfigProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
