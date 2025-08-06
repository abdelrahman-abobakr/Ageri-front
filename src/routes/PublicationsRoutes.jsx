// routes/PublicationsRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import researchService from '../services/researchService';
import PublicationsListPage from '../components/Publications/PublicationsListPage';
import PublicationDetailPage from '../components/Publications/PublicationDetailPage';
import PublicationFormPage from '../components/Publications/PublicationFormPage';

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
            <PublicationFormPage />
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
            <PublicationFormPage />
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

// Main App Routes Integration Example
// app/Routes.jsx or similar main routing file
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Protected App Routes */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Research Publications Routes */}
        <Route path="research/publications/*" element={<PublicationsRoutes />} />
        
        {/* Other App Routes */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Public Routes */}
      <Route path="/public/publications" element={<PublicPublicationsPage />} />
      <Route path="/public/publications/:id" element={<PublicPublicationDetailPage />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Hook for Publications Navigation
export const usePublicationsNavigation = () => {
  const navigate = useNavigate();
  
  return {
    // Navigate to publications list
    goToPublications: () => navigate('/app/research/publications'),
    
    // Navigate to specific publication
    goToPublication: (id) => navigate(`/app/research/publications/${id}`),
    
    // Navigate to create new publication
    goToCreatePublication: () => navigate('/app/research/publications/new'),
    
    // Navigate to edit publication
    goToEditPublication: (id) => navigate(`/app/research/publications/${id}/edit`),
    
    // Admin navigation
    goToPendingPublications: () => navigate('/app/research/publications/admin/pending'),
    goToApprovedPublications: () => navigate('/app/research/publications/admin/approved'),
    goToRejectedPublications: () => navigate('/app/research/publications/admin/rejected'),
    goToStatistics: () => navigate('/app/research/publications/admin/statistics'),
    
    // Go back
    goBack: () => navigate(-1),
  };
};

// Context for Publications State Management
import React, { createContext, useContext, useReducer } from 'react';

const PublicationsContext = createContext();

// Publications state management
const initialState = {
  publications: [],
  currentPublication: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {},
  sorter: { field: 'created_at', order: 'descend' },
  selectedPublications: [],
  statistics: null,
};

const publicationsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PUBLICATIONS':
      return { 
        ...state, 
        publications: action.payload.results || action.payload,
        pagination: {
          ...state.pagination,
          total: action.payload.count || action.payload.length,
        },
        loading: false,
        error: null
      };
    
    case 'SET_CURRENT_PUBLICATION':
      return { ...state, currentPublication: action.payload };
    
    case 'UPDATE_PUBLICATION':
      return {
        ...state,
        publications: state.publications.map(pub =>
          pub.id === action.payload.id ? { ...pub, ...action.payload } : pub
        ),
        currentPublication: state.currentPublication?.id === action.payload.id 
          ? { ...state.currentPublication, ...action.payload }
          : state.currentPublication
      };
    
    case 'DELETE_PUBLICATION':
      return {
        ...state,
        publications: state.publications.filter(pub => pub.id !== action.payload),
        currentPublication: state.currentPublication?.id === action.payload 
          ? null 
          : state.currentPublication
      };
    
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'SET_SORTER':
      return { ...state, sorter: action.payload };
    
    case 'SET_SELECTED_PUBLICATIONS':
      return { ...state, selectedPublications: action.payload };
    
    case 'SET_STATISTICS':
      return { ...state, statistics: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// Publications Provider
export const PublicationsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(publicationsReducer, initialState);
  
  const value = {
    ...state,
    dispatch,
    
    // Action creators
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    setPublications: (publications) => dispatch({ type: 'SET_PUBLICATIONS', payload: publications }),
    setCurrentPublication: (publication) => dispatch({ type: 'SET_CURRENT_PUBLICATION', payload: publication }),
    updatePublication: (publication) => dispatch({ type: 'UPDATE_PUBLICATION', payload: publication }),
    deletePublication: (id) => dispatch({ type: 'DELETE_PUBLICATION', payload: id }),
    setPagination: (pagination) => dispatch({ type: 'SET_PAGINATION', payload: pagination }),
    setFilters: (filters) => dispatch({ type: 'SET_FILTERS', payload: filters }),
    setSorter: (sorter) => dispatch({ type: 'SET_SORTER', payload: sorter }),
    setSelectedPublications: (selected) => dispatch({ type: 'SET_SELECTED_PUBLICATIONS', payload: selected }),
    setStatistics: (stats) => dispatch({ type: 'SET_STATISTICS', payload: stats }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
  };
  
  return (
    <PublicationsContext.Provider value={value}>
      {children}
    </PublicationsContext.Provider>
  );
};

// Hook to use Publications context
export const usePublications = () => {
  const context = useContext(PublicationsContext);
  if (!context) {
    throw new Error('usePublications must be used within a PublicationsProvider');
  }
  return context;
};

// Custom hooks for Publications operations
export const usePublicationsOperations = () => {
  const { dispatch } = usePublications();
  const { t } = useTranslation();
  
  const loadPublications = async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await researchService.getAllPublications(params);
      dispatch({ type: 'SET_PUBLICATIONS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      message.error(t('failed_to_load_publications'));
      throw error;
    }
  };
  
  const loadMyPublications = async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await researchService.getMyPublications(params);
      dispatch({ type: 'SET_PUBLICATIONS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      message.error(t('failed_to_load_my_publications'));
      throw error;
    }
  };
  
  const loadPublication = async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const publication = await researchService.getPublicationById(id);
      dispatch({ type: 'SET_CURRENT_PUBLICATION', payload: publication });
      return publication;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      message.error(t('failed_to_load_publication'));
      throw error;
    }
  };

  const createPublication = async (data) => {
    try {
      const publication = await researchService.createPublication(data);
      message.success(t('publication_created_successfully'));
      return publication;
    } catch (error) {
      message.error(t('failed_to_create_publication'));
      throw error;
    }
  };

  const updatePublication = async (id, data) => {
    try {
      const publication = await researchService.updatePublication(id, data);
      dispatch({ type: 'UPDATE_PUBLICATION', payload: publication });
      message.success(t('publication_updated_successfully'));
      return publication;
    } catch (error) {
      message.error(t('failed_to_update_publication'));
      throw error;
    }
  };
  
  const deletePublication = async (id) => {
    try {
      await researchService.deletePublication(id);
      dispatch({ type: 'DELETE_PUBLICATION', payload: id });
      message.success(t('publication_deleted_successfully'));
    } catch (error) {
      message.error(t('failed_to_delete_publication'));
      throw error;
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await researchService.getPublicationStatistics();
      dispatch({ type: 'SET_STATISTICS', payload: stats });
      return stats;
    } catch (error) {
      console.error('Failed to load statistics:', error);
      // Don't show error message for statistics
      return null;
    }
  };
  
  return {
    loadPublications,
    loadMyPublications,
    loadPublication,
    createPublication,
    updatePublication,
    deletePublication,
    loadStatistics,
  };
};

// Breadcrumb configuration for publications
export const getPublicationsBreadcrumb = (pathname, publicationTitle = '') => {
  const items = [
    {
      title: 'Dashboard',
      href: '/app/dashboard',
    },
    {
      title: 'Research',
    },
  ];
  
  if (pathname === '/app/research/publications') {
    items.push({
      title: 'Publications',
    });
  } else if (pathname === '/app/research/publications/new') {
    items.push(
      {
        title: 'Publications',
        href: '/app/research/publications',
      },
      {
        title: 'New Publication',
      }
    );
  } else if (pathname.includes('/edit')) {
    items.push(
      {
        title: 'Publications',
        href: '/app/research/publications',
      },
      {
        title: publicationTitle || 'Publication',
        href: pathname.replace('/edit', ''),
      },
      {
        title: 'Edit',
      }
    );
  } else if (pathname.match(/\/app\/research\/publications\/\d+$/)) {
    items.push(
      {
        title: 'Publications',
        href: '/app/research/publications',
      },
      {
        title: publicationTitle || 'Publication Detail',
      }
    );
  }
  
  return items;
};

// Menu configuration for publications
export const getPublicationsMenuItems = (user) => {
  const items = [
    {
      key: 'publications-list',
      label: 'All Publications',
      icon: <FileTextOutlined />,
      path: '/app/research/publications',
    },
  ];
  
  if (user?.role === 'researcher' || user?.is_admin) {
    items.push({
      key: 'publications-create',
      label: 'Create Publication',
      icon: <PlusOutlined />,
      path: '/app/research/publications/new',
    });
  }
  
  if (user?.is_admin) {
    items.push(
      {
        type: 'divider',
      },
      {
        key: 'publications-admin',
        label: 'Admin',
        icon: <SettingsOutlined />,
        children: [
          {
            key: 'publications-pending',
            label: 'Pending Review',
            path: '/app/research/publications/admin/pending',
          },
          {
            key: 'publications-approved',
            label: 'Approved',
            path: '/app/research/publications/admin/approved',
          },
          {
            key: 'publications-rejected',
            label: 'Rejected',
            path: '/app/research/publications/admin/rejected',
          },
          {
            key: 'publications-statistics',
            label: 'Statistics',
            path: '/app/research/publications/admin/statistics',
          },
        ],
      }
    );
  }
  
  return items;
};