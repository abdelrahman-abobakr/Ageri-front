// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  RESEARCHER: 'researcher',
  GUEST: 'guest',
};

// Publication status
export const PUBLICATION_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
};

// Service request status
export const SERVICE_REQUEST_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Course status
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// User approval status
export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Request priorities
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// File types
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  SPREADSHEETS: ['xls', 'xlsx', 'csv'],
  PRESENTATIONS: ['ppt', 'pptx'],
  ARCHIVES: ['zip', 'rar', '7z'],
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'YYYY-MM-DD',
  DISPLAY_WITH_TIME: 'YYYY-MM-DD HH:mm',
  API: 'YYYY-MM-DD',
  FULL: 'YYYY-MM-DD HH:mm:ss',
};

// User permissions matrix based on your specification
export const PERMISSIONS = {
  // Content Viewing
  VIEW_PUBLICATIONS: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: true,
    [USER_ROLES.RESEARCHER]: true,
    [USER_ROLES.GUEST]: true,
  },
  VIEW_EVENTS_ANNOUNCEMENTS: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: true,
    [USER_ROLES.RESEARCHER]: true,
    [USER_ROLES.GUEST]: true,
  },
  VIEW_COURSE_CATALOG: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: true,
    [USER_ROLES.RESEARCHER]: true,
    [USER_ROLES.GUEST]: true,
  },
  VIEW_SERVICE_CATALOG: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: true,
    [USER_ROLES.RESEARCHER]: true,
    [USER_ROLES.GUEST]: true,
  },

  // Content Creation
  SUBMIT_PUBLICATIONS: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: true,
    [USER_ROLES.RESEARCHER]: true,
    [USER_ROLES.GUEST]: false,
  },
  CREATE_EVENTS_POSTS: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: true,
    [USER_ROLES.RESEARCHER]: false,
    [USER_ROLES.GUEST]: false,
  },
  CREATE_COURSES: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: true,
    [USER_ROLES.RESEARCHER]: false,
    [USER_ROLES.GUEST]: false,
  },

  // Enrollment & Requests
  ENROLL_COURSES: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: true,
    [USER_ROLES.RESEARCHER]: true,
    [USER_ROLES.GUEST]: true, // May need to register first
  },
  REQUEST_SERVICES: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: true,
    [USER_ROLES.RESEARCHER]: true,
    [USER_ROLES.GUEST]: true, // May need to register first
  },

  // Management
  USER_APPROVAL: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: false,
    [USER_ROLES.RESEARCHER]: false,
    [USER_ROLES.GUEST]: false,
  },
  CONTENT_MODERATION: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: true,
    [USER_ROLES.RESEARCHER]: false,
    [USER_ROLES.GUEST]: false,
  },

  // System Access
  ACCESS_ANALYTICS: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: false,
    [USER_ROLES.RESEARCHER]: false,
    [USER_ROLES.GUEST]: false,
  },
  ACCESS_ADMIN_PANEL: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MODERATOR]: false,
    [USER_ROLES.RESEARCHER]: false,
    [USER_ROLES.GUEST]: false,
  },
};

// Helper function to check permissions
export const hasPermission = (userRole, permission) => {
  return PERMISSIONS[permission]?.[userRole] || false;
};

// API Base URLs
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// API endpoints - Complete list based on backend implementation
export const API_ENDPOINTS = {
  // Authentication & User Management
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/token/refresh/',
    PROFILE: '/auth/users/me/',
    UPDATE_PROFILE: '/auth/users/me/',
    AVATAR_UPLOAD: '/auth/users/me/avatar/',
    USERS: '/auth/users/',
    USER_DETAIL: (id) => `/auth/users/${id}/`,
    APPROVE_USER: (id) => `/auth/users/${id}/approve/`,
  },

  // Research Management
  RESEARCH: {
    PUBLICATIONS: '/research/publications/',
    PUBLICATION_DETAIL: (id) => `/research/publications/${id}/`,
    PUBLICATION_AUTHORS: (id) => `/research/publications/${id}/authors/`,
    REMOVE_AUTHOR: (pubId, authorId) => `/research/publications/${pubId}/authors/${authorId}/`,
    PUBLICATION_FILES: (id) => `/research/publications/${id}/files/`,
    DELETE_FILE: (pubId, fileId) => `/research/publications/${pubId}/files/${fileId}/`,
  },

  // Organization Management
  ORGANIZATION: {
    DEPARTMENTS: '/organization/departments/',
    DEPARTMENT_DETAIL: (id) => `/organization/departments/${id}/`,
    LABS: '/organization/labs/',
    LAB_DETAIL: (id) => `/organization/labs/${id}/`,
    ASSIGNMENTS: '/organization/assignments/',
    MY_ASSIGNMENTS: '/organization/assignments/my/',
    LAB_RESEARCHERS: (id) => `/organization/labs/${id}/researchers/`,
    SETTINGS: '/organization/settings/',
  },

  // Training System
  TRAINING: {
    COURSES: '/training/courses/',
    COURSE_DETAIL: (id) => `/training/courses/${id}/`,
    ENROLL: (id) => `/training/courses/${id}/enroll/`,
    UNENROLL: (id) => `/training/courses/${id}/unenroll/`,
    COURSE_ENROLLMENTS: (id) => `/training/courses/${id}/enrollments/`,
    MY_ENROLLMENTS: '/training/my-enrollments/',
    SUMMER_PROGRAMS: '/training/summer-programs/',
    SUMMER_PROGRAM_DETAIL: (id) => `/training/summer-programs/${id}/`,
    PUBLIC_SERVICES: '/training/public-services/',
    PUBLIC_SERVICE_DETAIL: (id) => `/training/public-services/${id}/`,
  },

  // Services Management
  SERVICES: {
    TEST_SERVICES: '/services/test-services/',
    TEST_SERVICE_DETAIL: (id) => `/services/test-services/${id}/`,
    REQUESTS: '/services/requests/',
    REQUEST_DETAIL: (id) => `/services/requests/${id}/`,
    ASSIGN_TECHNICIAN: (id) => `/services/requests/${id}/assign-technician/`,
    UPDATE_STATUS: (id) => `/services/requests/${id}/update-status/`,
    MY_REQUESTS: '/services/my-requests/',
  },

  // Content Management
  CONTENT: {
    ANNOUNCEMENTS: '/content/announcements/',
    ANNOUNCEMENT_DETAIL: (id) => `/content/announcements/${id}/`,
    POSTS: '/content/posts/',
    POST_DETAIL: (id) => `/content/posts/${id}/`,
    POST_COMMENTS: (id) => `/content/posts/${id}/comments/`,
    COMMENT_DETAIL: (id) => `/content/comments/${id}/`,
  },

  // Search & Analytics
  SEARCH: {
    GLOBAL: '/search/',
    PUBLICATIONS: '/search/publications/',
    USERS: '/search/users/',
  },

  ANALYTICS: {
    DASHBOARD: '/dashboard/analytics/', // Special endpoint outside /api prefix
    PUBLICATIONS: '/analytics/publications/',
    USERS: '/analytics/users/',
    SERVICES: '/analytics/services/',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications/',
    MARK_READ: (id) => `/notifications/${id}/mark-read/`,
    MARK_ALL_READ: '/notifications/mark-all-read/',
  },

  // Admin System Management
  ADMIN: {
    SYSTEM_INFO: '/admin/system-info/',
    CLEAR_CACHE: '/admin/clear-cache/',
    HEALTH_CHECK: '/admin/health-check/',
  },
};

// Theme colors (Governmental style)
export const THEME_COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#f5222d',
  INFO: '#13c2c2',
  BACKGROUND: '#f0f2f5',
  WHITE: '#ffffff',
  GRAY: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#f0f0f0',
    300: '#d9d9d9',
    400: '#bfbfbf',
    500: '#8c8c8c',
    600: '#595959',
    700: '#434343',
    800: '#262626',
    900: '#1f1f1f',
  },
};

// Layout breakpoints
export const BREAKPOINTS = {
  XS: 480,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1600,
};

// Menu items for different roles
export const MENU_ITEMS = {
  [USER_ROLES.ADMIN]: [
    { key: 'dashboard', label: 'Dashboard', icon: 'DashboardOutlined', path: '/dashboard' },
    { key: 'users', label: 'User Management', icon: 'UserOutlined', path: '/users' },
    { key: 'research', label: 'Research', icon: 'BookOutlined', path: '/research' },
    { key: 'organization', label: 'Organization', icon: 'BankOutlined', path: '/organization' },
    { key: 'training', label: 'Training', icon: 'ReadOutlined', path: '/training' },
    { key: 'services', label: 'Services', icon: 'ToolOutlined', path: '/services' },
    { key: 'content', label: 'Content', icon: 'FileTextOutlined', path: '/content' },
    { key: 'analytics', label: 'Analytics', icon: 'BarChartOutlined', path: '/analytics' },
    { key: 'notifications', label: 'Notifications', icon: 'BellOutlined', path: '/notifications' },
    { key: 'settings', label: 'Settings', icon: 'SettingOutlined', path: '/settings' },
  ],
  [USER_ROLES.MODERATOR]: [
    { key: 'dashboard', label: 'Dashboard', icon: 'DashboardOutlined', path: '/dashboard' },
    { key: 'research', label: 'Research', icon: 'BookOutlined', path: '/research' },
    { key: 'training', label: 'Training', icon: 'ReadOutlined', path: '/training' },
    { key: 'services', label: 'Services', icon: 'ToolOutlined', path: '/services' },
    { key: 'content', label: 'Content', icon: 'FileTextOutlined', path: '/content' },
    { key: 'notifications', label: 'Notifications', icon: 'BellOutlined', path: '/notifications' },
  ],
  [USER_ROLES.RESEARCHER]: [
    { key: 'home', label: 'Home', icon: 'DashboardOutlined', path: '/app/home' },
    { key: 'dashboard', label: 'Dashboard', icon: 'DashboardOutlined', path: '/dashboard' },
    { key: 'research', label: 'My Research', icon: 'BookOutlined', path: '/research/publications' },
    { key: 'profile', label: 'Profile', icon: 'UserOutlined', path: '/profile' },
  ],
  [USER_ROLES.GUEST]: [
    { key: 'home', label: 'Home', icon: 'DashboardOutlined', path: '/' },
    { key: 'announcements', label: 'Announcements', icon: 'FileTextOutlined', path: '/announcements' },
    { key: 'courses', label: 'Courses', icon: 'ReadOutlined', path: '/courses' },
    { key: 'services', label: 'Services', icon: 'ToolOutlined', path: '/services' },
  ],
};
