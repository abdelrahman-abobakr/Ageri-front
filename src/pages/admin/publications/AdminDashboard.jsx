import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CheckCircle, XCircle, Eye, Star, StarOff, Calendar, 
  User, FileText, AlertCircle, X, Loader2 
} from 'lucide-react';
// import '../../styles/ResearchManagementPage.css';
// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// API Service
const api = {
  get: async (url) => {
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = response;
      throw error;
    }
    
    return response.json();
  },
  
  post: async (url, data) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = response;
      throw error;
    }
    
    return response.json();
  },
  
  patch: async (url, data) => {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = response;
      throw error;
    }
    
    return response.json();
  }
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 
                 type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
               type === 'error' ? <XCircle className="w-5 h-5" /> : 
               <AlertCircle className="w-5 h-5" />;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 max-w-md`}>
      {icon}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Review Modal Component
const ReviewModal = ({ isOpen, onClose, onSubmit, title, action, loading }) => {
  const [reviewNotes, setReviewNotes] = useState('');

  const handleSubmit = () => {
    onSubmit(reviewNotes);
    setReviewNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            {action === 'approve' ? 'Approve Publication' : 'Reject Publication'}
          </h3>
          <p className="text-sm text-gray-600 mt-1 truncate">{title}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes {action === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              placeholder={`Enter your ${action} notes here...`}
              required={action === 'reject'}
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || (action === 'reject' && !reviewNotes.trim())}
              className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                action === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300' 
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {action === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Publications Table Component
const PendingPublicationsTable = ({ publications, onAction, loading }) => {
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      published: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = () => {
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading publications...</span>
        </div>
      </div>
    );
  }

  if (!publications.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No publications found</p>
          <p className="text-sm">There are no publications to review at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publication</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {publications.map((publication) => (
              <tr key={publication.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium">
                        {publication.id}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2" title={publication.title}>
                        {publication.title}
                      </p>
                      {publication.research_area && (
                        <p className="text-xs text-gray-500 mt-1">{publication.research_area}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon()}
                    <span className="text-sm text-gray-900 capitalize">
                      {publication.publication_type.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{publication.submitted_by.name}</p>
                      <p className="text-xs text-gray-500">{publication.submitted_by.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {formatDate(publication.submitted_at)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(publication.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {publication.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onAction('approve', publication)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => onAction('reject', publication)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </>
                    )}
                    
                    {publication.status === 'approved' && (
                      <button
                        onClick={() => onAction('publish', publication)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Publish
                      </button>
                    )}
                    
                    {publication.status === 'published' && (
                      <button
                        onClick={() => onAction('toggleFeature', publication)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          publication.is_featured
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {publication.is_featured ? <Star className="w-3 h-3" /> : <StarOff className="w-3 h-3" />}
                        {publication.is_featured ? 'Featured' : 'Feature'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, action: '', publication: null });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const fetchPublications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`${API_BASE_URL}/api/admin/review/publications/`);
      setPublications(response.results);
    } catch (error) {
      console.error('Error fetching publications:', error);
      showToast('Failed to fetch publications', 'error');
      
      // Handle unauthorized (401) errors
      if (error.response && error.response.status === 401) {
        // You might want to redirect to login or refresh token here
        showToast('Session expired. Please login again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = async (action, publication) => {
    if (action === 'approve' || action === 'reject') {
      setModal({ isOpen: true, action, publication });
    } else {
      await performAction(action, publication);
    }
  };

  const performAction = async (action, publication, reviewNotes = '') => {
    try {
      setActionLoading(true);
      let endpoint = '';
      let requestData = {};
      
      const baseData = {
        title: publication.title,
        abstract: publication.abstract || '',
        publication_type: publication.publication_type,
        research_area: publication.research_area || '',
        keywords: publication.keywords || '',
        journal_name: publication.journal_name || '',
        conference_name: publication.conference_name || '',
        publisher: publication.publisher || '',
        publication_date: publication.publication_date || new Date().toISOString().split('T')[0],
        doi: publication.doi || '',
        url: publication.url || '',
        pdf_url: publication.pdf_url || '',
        is_public: publication.is_public || true,
        priority: publication.priority || 0,
        citation_count: publication.citation_count || 0
      };

      switch (action) {
        case 'approve':
          endpoint = `${API_BASE_URL}/api/admin/review/publications/${publication.id}/approve/`;
          requestData = {
            ...baseData,
            review_notes: reviewNotes,
            status: 'approved',
            is_featured: publication.is_featured || false
          };
          await api.post(endpoint, requestData);
          break;
          
        case 'reject':
          endpoint = `${API_BASE_URL}/api/admin/review/publications/${publication.id}/reject/`;
          requestData = {
            ...baseData,
            review_notes: reviewNotes,
            status: 'rejected',
            is_featured: false
          };
          await api.post(endpoint, requestData);
          break;
          
        case 'publish':
          endpoint = `${API_BASE_URL}/api/admin/review/publications/${publication.id}/publish/`;
          requestData = {
            ...baseData,
            status: 'published',
            review_notes: publication.review_notes || '',
            is_featured: publication.is_featured || false
          };
          await api.post(endpoint, requestData);
          break;
          
        case 'toggleFeature':
          endpoint = `${API_BASE_URL}/api/admin/review/publications/${publication.id}/feature/`;
          requestData = {
            is_featured: !publication.is_featured
          };
          await api.patch(endpoint, requestData);
          break;
      }

      // Update local state
      setPublications(prev => prev.map(pub => {
        if (pub.id === publication.id) {
          return {
            ...pub,
            status: action === 'approve' ? 'approved' : 
                   action === 'reject' ? 'rejected' : 
                   action === 'publish' ? 'published' : pub.status,
            is_featured: action === 'toggleFeature' ? !pub.is_featured : pub.is_featured,
            review_notes: action === 'approve' || action === 'reject' ? reviewNotes : pub.review_notes
          };
        }
        return pub;
      }));

      const actionMessages = {
        approve: 'Publication approved successfully',
        reject: 'Publication rejected successfully',
        publish: 'Publication published successfully',
        toggleFeature: publication.is_featured ? 
          'Publication removed from featured' : 
          'Publication featured successfully'
      };

      showToast(actionMessages[action], 'success');
      setModal({ isOpen: false, action: '', publication: null });
    } catch (error) {
      console.error(`Error ${action}ing publication:`, error);
      showToast(`Failed to ${action} publication`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalSubmit = (reviewNotes) => {
    performAction(modal.action, modal.publication, reviewNotes);
  };

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  const stats = useMemo(() => ({
    total: publications.length,
    pending: publications.filter(p => p.status === 'pending').length,
    approved: publications.filter(p => p.status === 'approved').length,
    published: publications.filter(p => p.status === 'published').length,
    featured: publications.filter(p => p.is_featured).length
  }), [publications]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Review Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and review research publications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-blue-600">{stats.published}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-3xl font-bold text-purple-600">{stats.featured}</p>
              </div>
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Publications Table */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">All Publications</h2>
            <button
              onClick={fetchPublications}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Refresh
            </button>
          </div>
        </div>

        <PendingPublicationsTable
          publications={publications}
          onAction={handleAction}
          loading={loading}
        />

        {/* Review Modal */}
        <ReviewModal
          isOpen={modal.isOpen}
          onClose={() => setModal({ isOpen: false, action: '', publication: null })}
          onSubmit={handleModalSubmit}
          title={modal.publication?.title}
          action={modal.action}
          loading={actionLoading}
        />

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
