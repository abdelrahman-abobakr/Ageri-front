import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle, XCircle, Eye, Calendar,
  User, FileText, AlertCircle, X, Loader2
} from 'lucide-react';
import '../../styles/ResearchManagementPage.css';
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

  const icon = type === 'success' ? <CheckCircle className="toast-icon" /> :
    type === 'error' ? <XCircle className="toast-icon" /> :
      <AlertCircle className="toast-icon" />;

  return (
    <div className={`toast-container toast-${type}`}>
      {icon}
      <span className="toast-message">{message}</span>
      <button onClick={onClose} className="toast-close-btn">
        <X className="toast-close-icon" />
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {action === 'approve' ? 'Approve Publication' : 'Reject Publication'}
          </h3>
          <p className="modal-subtitle">{title}</p>
        </div>
        <div className="modal-body">
          <div className="modal-form-group">
            <label className="modal-label">
              Review Notes {action === 'reject' && <span className="modal-label-required">*</span>}
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="modal-textarea"
              rows="4"
              placeholder={`Enter your ${action} notes here...`}
              required={action === 'reject'}
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="modal-btn modal-btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || (action === 'reject' && !reviewNotes.trim())}
              className={`modal-btn modal-btn-${action}`}
            >
              {loading && <Loader2 className="modal-btn-loader" />}
              {action === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Publications Table Component with Pagination
const PAGE_SIZE = 10;
const PendingPublicationsTable = ({ publications, onAction, loading, page, pageSize, total, onPageChange }) => {
  const getStatusBadge = (status) => {
    // Only show badge for allowed statuses (no draft, no featured)
    if (status === 'draft' || status === 'featured') return null;
    const allowed = ['pending', 'approved', 'rejected', 'published'];
    if (!allowed.includes(status)) return null;
    return (
      <span className={`status-badge status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = () => <FileText className="type-icon" />;

  if (loading) {
    return (
      <div className="table-card loading-card">
        <div className="table-loading">
          <Loader2 className="table-loader" />
          <span className="table-loading-text">Loading publications...</span>
        </div>
      </div>
    );
  }

  if (!publications.length) {
    return (
      <div className="table-card empty-card">
        <div className="table-empty">
          <FileText className="table-empty-icon" />
          <p className="table-empty-title">No publications found</p>
          <p className="table-empty-desc">There are no publications to review at this time.</p>
        </div>
      </div>
    );
  }

  // Pagination controls
  const totalPages = Math.ceil(total / pageSize);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="table">
          <thead className="table-thead">
            <tr>
              <th className="table-th">Publication</th>
              <th className="table-th">Type</th>
              <th className="table-th">Submitted By</th>
              <th className="table-th">Date</th>
              <th className="table-th">Status</th>
              <th className="table-th table-th-actions">Actions</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {publications.map((publication) => (
              <tr key={publication.id} className="table-row">
                <td className="table-td">
                  <div className="pub-main">
                    <div className="pub-id">{publication.id}</div>
                    <div className="pub-info">
                      <p className="pub-title" title={publication.title}>{publication.title}</p>
                      {publication.research_area && (
                        <p className="pub-area">{publication.research_area}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="table-td">
                  <div className="pub-type">
                    {getTypeIcon()}
                    <span className="pub-type-label">{publication.publication_type.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="table-td">
                  <div className="pub-user">
                    <div className="pub-user-avatar"><User className="pub-user-icon" /></div>
                    <div>
                      <p className="pub-user-name">{publication.submitted_by.name}</p>
                      <p className="pub-user-email">{publication.submitted_by.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-td">
                  <div className="pub-date">
                    <Calendar className="pub-date-icon" />
                    {formatDate(publication.submitted_at)}
                  </div>
                </td>
                <td className="table-td table-td-status">
                  <div className="status-badge-wrapper">
                    {getStatusBadge(publication.status)}
                  </div>
                </td>
                <td className="table-td table-td-actions">
                  <div className="pub-actions">
                    {publication.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onAction('approve', publication)}
                          className="action-btn action-btn-approve"
                        >
                          <CheckCircle className="action-btn-icon" />
                          Approve
                        </button>
                        <button
                          onClick={() => onAction('reject', publication)}
                          className="action-btn action-btn-reject"
                        >
                          <XCircle className="action-btn-icon" />
                          Reject
                        </button>
                      </>
                    )}
                    {publication.status === 'approved' && (
                      <button
                        onClick={() => onAction('publish', publication)}
                        className="action-btn action-btn-publish"
                      >
                        <Eye className="action-btn-icon" />
                        Publish
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          {pages.map((p) => (
            <button
              key={p}
              className={`pagination-btn${p === page ? ' active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
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
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const fetchPublications = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`${API_BASE_URL}/api/admin/review/publications/?page=${pageNum}&page_size=${PAGE_SIZE}`);
      setPublications(response.results);
      setTotal(response.count || response.results.length);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching publications:', error);
      showToast('Failed to fetch publications', 'error');
      if (error.response && error.response.status === 401) {
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
            status: 'approved'
          };
          await api.post(endpoint, requestData);
          break;
        case 'reject':
          endpoint = `${API_BASE_URL}/api/admin/review/publications/${publication.id}/reject/`;
          requestData = {
            ...baseData,
            review_notes: reviewNotes,
            status: 'rejected'
          };
          await api.post(endpoint, requestData);
          break;
        case 'publish':
          endpoint = `${API_BASE_URL}/api/admin/review/publications/${publication.id}/publish/`;
          requestData = {
            ...baseData,
            status: 'published',
            review_notes: publication.review_notes || ''
          };
          await api.post(endpoint, requestData);
          break;
        default:
          break;
      }

      // Refetch publications for current page
      fetchPublications(page);

      const actionMessages = {
        approve: 'Publication approved successfully',
        reject: 'Publication rejected successfully',
        publish: 'Publication published successfully'
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
    fetchPublications(1);
  }, [fetchPublications]);

  // Pagination handler
  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    fetchPublications(newPage);
  };

  const stats = useMemo(() => ({
    total: total,
    pending: publications.filter(p => p.status === 'pending').length,
    approved: publications.filter(p => p.status === 'approved').length,
    published: publications.filter(p => p.status === 'published').length
  }), [publications, total]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Review Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and review research publications</p>
        </div>

        {/* Statistics Section - Professional Design */}
        <div className="statistics-section">
          <div className="stat-card stat-total">
            <div className="stat-icon"><FileText /></div>
            <div className="stat-info">
              <div className="stat-label">Total</div>
              <div className="stat-value">{stats.total}</div>
            </div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-icon"><AlertCircle /></div>
            <div className="stat-info">
              <div className="stat-label">Pending</div>
              <div className="stat-value">{stats.pending}</div>
            </div>
          </div>
          <div className="stat-card stat-approved">
            <div className="stat-icon"><CheckCircle /></div>
            <div className="stat-info">
              <div className="stat-label">Approved</div>
              <div className="stat-value">{stats.approved}</div>
            </div>
          </div>
          <div className="stat-card stat-published">
            <div className="stat-icon"><Eye /></div>
            <div className="stat-info">
              <div className="stat-label">Published</div>
              <div className="stat-value">{stats.published}</div>
            </div>
          </div>
        </div>

        {/* Publications Table */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">All Publications</h2>
            <button
              onClick={() => fetchPublications(page)}
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
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={handlePageChange}
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