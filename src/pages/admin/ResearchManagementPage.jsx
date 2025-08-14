import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle, XCircle, Eye, Calendar,
  User, FileText, AlertCircle, X, Loader2, ExternalLink
} from 'lucide-react';
import '../../styles/ResearchManagementPage.css';

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const InlineStyles = () => (
  <style jsx>{`
    .cards-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-top: 20px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
      padding: 24px;
    }

    .publication-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .publication-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px 12px;
      background: #f8fafc;
      border-bottom: 1px solid #e5e7eb;
    }

    .card-content {
      padding: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 16px 20px;
      background: #f8fafc;
      border-top: 1px solid #e5e7eb;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: 2px solid transparent;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      flex: 1;
      justify-content: center;
      min-width: 100px;
    }

    .statistics-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .cards-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 16px;
      }
    }
  `}</style>
);
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

// Publication Details Modal Component
const PublicationDetailsModal = ({ isOpen, onClose, publication }) => {
  if (!isOpen || !publication) return null;

  // Helper to render a detail item only if value exists
  const DetailItem = ({ label, value }) => value ? (
    <div className="detail-item">
      <label className="detail-label">{label}</label>
      <p className="detail-value">{value}</p>
    </div>
  ) : null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-large">
        <div className="modal-header">
          <h3 className="modal-title">Publication Details</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body">
          <div className="publication-details">
            <div className="detail-section">
              <h4 className="detail-title">Basic Information</h4>
              <div className="detail-grid">
                <DetailItem label="ID" value={publication.id} />
                <DetailItem label="Title" value={publication.title} />
                <DetailItem label="Type" value={publication.publication_type?.replace('_', ' ')} />

                <DetailItem label="Priority" value={publication.priority !== undefined ? publication.priority : null} />
                <DetailItem label="Is Featured" value={publication.is_featured ? 'Yes' : undefined} />
              </div>
            </div>

            {publication.abstract && (
              <div className="detail-section">
                <h4 className="detail-title">Abstract</h4>
                <p className="detail-text">{publication.abstract}</p>
              </div>
            )}

            <div className="detail-section">
              <h4 className="detail-title">Research Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <DetailItem label="Research Area" value={publication.research_area} />
                {publication.keywords && (
                  <div className="detail-item">
                    <label className="detail-label">Keywords</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {typeof publication.keywords === 'string'
                        ? publication.keywords.split(/\s+/).filter(Boolean).map((kw, idx) => (
                          <span key={idx} style={{
                            background: '#f3f4f6',
                            color: '#2563eb',
                            borderRadius: '12px',
                            padding: '2px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            marginRight: 2
                          }}>{kw}</span>
                        ))
                        : null}
                    </div>
                  </div>
                )}
                <DetailItem label="Journal" value={publication.journal_name} className="my-4" />
                <DetailItem label="Conference" value={publication.conference_name} className="my-4" />
                <DetailItem label="Publisher" value={publication.publisher} />
                <DetailItem label="Author Count" value={publication.author_count !== undefined ? publication.author_count : null} />
                <DetailItem label="Citation Count" value={publication.citation_count !== undefined ? publication.citation_count : null} />
              </div>
            </div>

            <div className="detail-section">
              <h4 className="detail-title">Publication Info</h4>
              <div className="detail-grid">
                <DetailItem label="Publication Date" value={publication.publication_date ? formatDate(publication.publication_date) : null} />
                <DetailItem label="DOI" value={publication.doi} />
                <DetailItem label="Document File" value={publication.document_file_url ? (<a href={publication.document_file_url} target="_blank" rel="noopener noreferrer">Download</a>) : null} />
              </div>
            </div>

            {(publication.url || publication.pdf_url) && (
              <div className="detail-section">
                <h4 className="detail-title">Links</h4>
                <div className="detail-links">
                  {publication.url && (
                    <a href={publication.url} target="_blank" rel="noopener noreferrer" className="detail-link">
                      <ExternalLink className="w-4 h-4" />
                      View Publication
                    </a>
                  )}
                  {publication.pdf_url && (
                    <a href={publication.pdf_url} target="_blank" rel="noopener noreferrer" className="detail-link">
                      <FileText className="w-4 h-4" />
                      View PDF
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h4 className="detail-title">Submission Details</h4>
              <div className="detail-grid">
                {publication.submitted_by && (
                  <div className="detail-item">
                    <label className="detail-label">Submitted By</label>
                    <div className="detail-user">
                      <User className="w-4 h-4" />
                      <div>
                        <p className="detail-user-name">{publication.submitted_by?.name}</p>
                        <p className="detail-user-email">{publication.submitted_by?.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                <DetailItem label="Submitted At" value={publication.submitted_at ? formatDate(publication.submitted_at) : null} />
              </div>
            </div>

            {publication.review_notes && (
              <div className="detail-section">
                <h4 className="detail-title">Review Notes</h4>
                <p className="detail-text">{publication.review_notes}</p>
              </div>
            )}
            {/* Authors Section */}
            {Array.isArray(publication.authors) && publication.authors.length > 0 && (
              <div className="detail-section">
                <h4 className="detail-title">Authors</h4>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {publication.authors.map((author, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      {author}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Review Modal Component
const ReviewModal = ({ isOpen, onClose, onSubmit, title, action, loading }) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Enhanced submit handler to catch and map field errors
  const handleSubmit = async () => {
    setFieldErrors({});
    try {
      await onSubmit(reviewNotes, setFieldErrors);
      setReviewNotes('');
    } catch (e) {
      // fallback: if onSubmit throws, do nothing (errors handled via setFieldErrors)
    }
  };

  if (!isOpen) return null;

  // Helper to render error below a field
  const renderFieldError = (field) => {
    if (fieldErrors[field] && Array.isArray(fieldErrors[field].messages)) {
      return (
        <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>
          {fieldErrors[field].messages.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </div>
      );
    }
    return null;
  };

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
            {renderFieldError('review_notes')}
          </div>
          {/* Example: show errors for journal_name and doi fields */}
          {renderFieldError('journal_name')}
          {renderFieldError('doi')}
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

// Publications Card Grid Component with Pagination
const PAGE_SIZE = 12;
const PublicationsCardGrid = ({
  publications,
  onAction,
  onViewDetails,
  loading,
  page,
  pageSize,
  total,
  onPageChange
}) => {
  // Only render the status badge in the card header, not in the actions section.
  const getStatusBadge = (status) => {
    if (status === 'draft' || status === 'featured') return null;
    const allowed = ['pending', 'approved', 'rejected', 'published'];
    if (!allowed.includes(status)) return null;
    return (
      <span className={`status-badge status-${status}`}
        style={{
          fontSize: '13px',
          fontWeight: 600,
          padding: '4px 14px',
          borderRadius: '16px',
          letterSpacing: '0.04em',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          background: status === 'published' ? '#dbeafe' : status === 'approved' ? '#d1fae5' : status === 'pending' ? '#fef3c7' : '#fecaca',
          color: status === 'published' ? '#1e40af' : status === 'approved' ? '#065f46' : status === 'pending' ? '#92400e' : '#991b1b',
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="cards-container">
        <InlineStyles />
        <div className="cards-loading">
          <Loader2 className="cards-loader" />
          <span className="cards-loading-text">Loading publications...</span>
        </div>
      </div>
    );
  }

  if (!publications.length) {
    return (
      <div className="cards-container">
        <div className="cards-empty">
          <FileText className="cards-empty-icon" />
          <p className="cards-empty-title">No publications found</p>
          <p className="cards-empty-desc">There are no publications to review at this time.</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="cards-container">
      <div className="cards-grid">
        {publications.map((publication) => (
          <div key={publication.id} className="publication-card" style={{ boxShadow: '0 4px 18px rgba(59,130,246,0.08)', border: '2px solid #e0e7ef', borderRadius: 20, position: 'relative' }}>
            {/* Card Header: Only place for status badge */}
            <div className="card-header" style={{ background: '#f3f6fa', borderBottom: '1.5px solid #e0e7ef', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
              <div className="card-id" style={{ fontWeight: 700, color: '#3b82f6', background: '#e0e7ef', borderRadius: 8, padding: '4px 12px' }}>#{publication.id}</div>
              <div className="card-status" style={{ display: 'flex', alignItems: 'center' }}>
                {getStatusBadge(publication.status)}
              </div>
            </div>

            <div className="card-content" style={{ padding: 24, gap: 18 }}>
              <div className="card-type" style={{ marginBottom: 8 }}>
                <FileText className="card-type-icon" style={{ color: '#6366f1' }} />
                <span className="card-type-label" style={{ color: '#6366f1', fontWeight: 600, fontSize: 15 }}>
                  {publication.publication_type?.replace('_', ' ')}
                </span>
              </div>

              <h3 className="card-title" title={publication.title} style={{ fontSize: 20, color: '#1e293b', fontWeight: 700, marginBottom: 6 }}>
                {publication.title}
              </h3>

              {publication.research_area && (
                <p className="card-research-area" style={{ color: '#3b82f6', background: '#e0f2fe', fontWeight: 500, borderRadius: 6, padding: '3px 10px', fontSize: 13, margin: 0, marginBottom: 8 }}>{publication.research_area}</p>
              )}

              {/* Keywords badges in card view */}
              {publication.keywords && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {typeof publication.keywords === 'string'
                    ? publication.keywords.split(/\s+/).filter(Boolean).map((kw, idx) => (
                      <span key={idx} style={{
                        background: '#f3f4f6',
                        color: '#2563eb',
                        borderRadius: '12px',
                        padding: '2px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        marginRight: 2
                      }}>{kw}</span>
                    ))
                    : null}
                </div>
              )}

              {publication.abstract && (
                <p className="card-abstract" style={{ color: '#64748b', fontSize: 15, margin: 0, marginBottom: 8 }}>
                  {publication.abstract.length > 150
                    ? `${publication.abstract.substring(0, 150)}...`
                    : publication.abstract
                  }
                </p>
              )}

              <div className="card-meta" style={{ borderTop: '1px solid #e0e7ef', paddingTop: 10, marginTop: 10, display: 'flex', flexDirection: 'row', gap: 24 }}>
                <div className="card-user" style={{ flex: 1, alignItems: 'center', gap: 10 }}>
                  <User className="card-user-icon" style={{ color: '#6366f1', background: '#e0e7ef', borderRadius: '50%', padding: 6, width: 36, height: 36 }} />
                  <div>
                    <p className="card-user-name" style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>{publication.submitted_by?.name}</p>
                    <p className="card-user-email" style={{ color: '#64748b', fontSize: 13, margin: 0 }}>{publication.submitted_by?.email}</p>
                  </div>
                </div>
                <div className="card-date" style={{ color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar className="card-date-icon" style={{ color: '#6366f1' }} />
                  <span>{formatDate(publication.submitted_at)}</span>
                </div>
              </div>
            </div>

            {/* Card Actions: No status badge here! */}
            <div className="card-actions" style={{ background: '#f3f6fa', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, borderTop: '1.5px solid #e0e7ef', padding: 18 }}>
              <button
                onClick={() => onViewDetails(publication)}
                className="action-btn action-btn-view"
                style={{ background: '#f3f4f6', color: '#374151', borderColor: '#d1d5db', fontWeight: 600, fontSize: 15 }}
              >
                <Eye className="action-btn-icon" />
                View Details
              </button>

              {publication.status === 'pending' && (
                <>
                  <button
                    onClick={() => onAction('approve', publication)}
                    className="action-btn action-btn-approve"
                    style={{ background: '#dcfdf7', color: '#065f46', borderColor: '#10b981', fontWeight: 600, fontSize: 15 }}
                  >
                    <CheckCircle className="action-btn-icon" />
                    Approve
                  </button>
                  <button
                    onClick={() => onAction('reject', publication)}
                    className="action-btn action-btn-reject"
                    style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#ef4444', fontWeight: 600, fontSize: 15 }}
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
                  style={{ background: '#dbeafe', color: '#1e40af', borderColor: '#3b82f6', fontWeight: 600, fontSize: 15 }}
                >
                  <Eye className="action-btn-icon" />
                  Publish
                </button>
              )}
            </div>
          </div>
        ))}
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

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                className={`pagination-btn${pageNum === page ? ' active' : ''}`}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

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
  const [reviewModal, setReviewModal] = useState({ isOpen: false, action: '', publication: null });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, publication: null });
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
      setReviewModal({ isOpen: true, action, publication });
    } else {
      await performAction(action, publication);
    }
  };

  const handleViewDetails = (publication) => {
    setDetailsModal({ isOpen: true, publication });
  };

  const performAction = async (action, publication, reviewNotes = '', setFieldErrors) => {
    try {
      setActionLoading(true);
      let endpoint = '';
      let requestData = {};
      const baseData = {
        title: publication.title,
        abstract: publication.abstract || '',
        publication_type: publication.publication_type,
        research_area: typeof publication.research_area === 'string' ? publication.research_area : Array.isArray(publication.research_area) ? publication.research_area.join(', ') : '',
        keywords: typeof publication.keywords === 'string' ? publication.keywords : Array.isArray(publication.keywords) ? publication.keywords.join(', ') : '',
        journal_name: publication.journal_name || '',
        conference_name: publication.conference_name || '',
        publisher: publication.publisher || '',
        publication_date: publication.publication_date || new Date().toISOString().split('T')[0],
        doi: publication.doi || '',
        url: publication.url || '',
        pdf_url: publication.pdf_url || '',
        is_public: publication.is_public !== undefined ? publication.is_public : true,
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

      fetchPublications(page);

      const actionMessages = {
        approve: 'Publication approved successfully',
        reject: 'Publication rejected successfully',
        publish: 'Publication published successfully'
      };

      showToast(actionMessages[action], 'success');
      setReviewModal({ isOpen: false, action: '', publication: null });
    } catch (error) {
      // Try to extract field errors from backend response (data.errors)
      let fieldErrors = {};
      if (error && error.response) {
        // Try .data.errors (most common in axios/fetch polyfills)
        if (error.response.data && error.response.data.errors) {
          fieldErrors = error.response.data.errors;
        } else {
          // fallback: try to parse as JSON
          try {
            const data = await error.response.json();
            if (data && data.errors) {
              fieldErrors = data.errors;
            }
          } catch (e) { }
        }
      }
      if (setFieldErrors && Object.keys(fieldErrors).length > 0) {
        setFieldErrors(fieldErrors);
        // Collect all error messages for toast
        const allMessages = Object.values(fieldErrors)
          .map(err => Array.isArray(err.messages) ? err.messages.join(' ') : '')
          .filter(Boolean)
          .join(' ');
        if (allMessages) {
          showToast(allMessages, 'error');
        } else {
          showToast(`Failed to ${action} publication`, 'error');
        }
      } else {
        // Try to show a general error message from backend if available
        let backendMsg = '';
        if (error.response && error.response.data && error.response.data.message) {
          backendMsg = error.response.data.message;
        }
        showToast(backendMsg || `Failed to ${action} publication`, 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalSubmit = (reviewNotes, setFieldErrors) => {
    performAction(reviewModal.action, reviewModal.publication, reviewNotes, setFieldErrors);
  };

  useEffect(() => {
    fetchPublications(1);
  }, [fetchPublications]);

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

        {/* Statistics Section */}
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

        {/* Publications Cards */}
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

        <PublicationsCardGrid
          publications={publications}
          onAction={handleAction}
          onViewDetails={handleViewDetails}
          loading={loading}
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={handlePageChange}
        />

        {/* Publication Details Modal */}
        <PublicationDetailsModal
          isOpen={detailsModal.isOpen}
          onClose={() => setDetailsModal({ isOpen: false, publication: null })}
          publication={detailsModal.publication}
        />

        {/* Review Modal */}
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={() => setReviewModal({ isOpen: false, action: '', publication: null })}
          onSubmit={handleModalSubmit}
          title={reviewModal.publication?.title}
          action={reviewModal.action}
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