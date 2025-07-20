/**
 * Error handling utilities for API responses
 */

/**
 * Parse API error response and return user-friendly messages
 * @param {Object} error - Axios error object
 * @returns {Object} - Parsed error information
 */
export const parseApiError = (error) => {
  // Network errors
  if (error.code === 'ERR_NETWORK') {
    return {
      type: 'network',
      message: 'Network error: Please check your internet connection and try again.',
      details: 'Unable to connect to the server. Please ensure the backend is running.'
    };
  }

  // Connection refused or server not running
  if (error.response?.status === 0 || !error.response) {
    return {
      type: 'connection',
      message: 'Connection failed: Unable to connect to the server.',
      details: 'Please check if the backend server is running and accessible.'
    };
  }

  const { status, data } = error.response;

  // Handle different HTTP status codes
  switch (status) {
    case 400: // Bad Request - Validation errors
      return parseBadRequestError(data);
    
    case 401: // Unauthorized
      return {
        type: 'auth',
        message: 'Invalid email or password.',
        details: data?.detail || 'Please check your credentials and try again.'
      };
    
    case 403: // Forbidden
      return {
        type: 'permission',
        message: 'Access denied: You don\'t have permission to perform this action.',
        details: data?.detail || 'Please contact an administrator if you believe this is an error.'
      };
    
    case 404: // Not Found
      return {
        type: 'notfound',
        message: 'Resource not found.',
        details: data?.detail || 'The requested resource could not be found.'
      };
    
    case 409: // Conflict
      return {
        type: 'conflict',
        message: 'Conflict: The resource already exists.',
        details: data?.detail || 'Please check if the information already exists.'
      };
    
    case 422: // Unprocessable Entity
      return parseBadRequestError(data);
    
    case 429: // Too Many Requests
      return {
        type: 'ratelimit',
        message: 'Too many requests: Please wait before trying again.',
        details: data?.detail || 'You have exceeded the rate limit. Please try again later.'
      };
    
    case 500: // Internal Server Error
      return {
        type: 'server',
        message: 'Server error: Something went wrong on our end.',
        details: 'Please try again later or contact support if the problem persists.'
      };
    
    default:
      return {
        type: 'unknown',
        message: `Error ${status}: ${data?.detail || 'An unexpected error occurred.'}`,
        details: 'Please try again or contact support if the problem persists.'
      };
  }
};

/**
 * Parse 400 Bad Request errors (validation errors)
 * @param {Object} data - Error response data
 * @returns {Object} - Parsed validation error
 */
const parseBadRequestError = (data) => {
  if (!data) {
    return {
      type: 'validation',
      message: 'Validation error: Please check your input.',
      details: 'Some fields contain invalid data.',
      fieldErrors: {}
    };
  }

  // Handle different error response formats
  let fieldErrors = {};
  let generalMessage = 'Please correct the following errors:';

  // Django REST Framework format: { field: ["error1", "error2"] }
  if (typeof data === 'object' && !Array.isArray(data)) {
    Object.keys(data).forEach(field => {
      const errors = data[field];
      if (Array.isArray(errors)) {
        fieldErrors[field] = errors.join(', ');
      } else if (typeof errors === 'string') {
        fieldErrors[field] = errors;
      }
    });

    // Handle non_field_errors
    if (data.non_field_errors) {
      const nonFieldError = Array.isArray(data.non_field_errors)
        ? data.non_field_errors.join(', ')
        : data.non_field_errors;

      // Handle specific error messages
      if (nonFieldError.includes('not approved yet')) {
        generalMessage = 'Your account is pending approval. Please wait for an administrator to approve your account.';
      } else if (nonFieldError.includes('Invalid credentials')) {
        generalMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else {
        generalMessage = nonFieldError;
      }
    }
  }

  // Handle string error messages
  if (typeof data === 'string') {
    generalMessage = data;
  }

  // Handle array of errors
  if (Array.isArray(data)) {
    generalMessage = data.join(', ');
  }

  return {
    type: 'validation',
    message: generalMessage,
    details: Object.keys(fieldErrors).length > 0 
      ? 'Please check the highlighted fields below.'
      : 'Please review your input and try again.',
    fieldErrors
  };
};

/**
 * Get user-friendly field name for display
 * @param {string} fieldName - API field name
 * @returns {string} - User-friendly field name
 */
export const getFieldDisplayName = (fieldName) => {
  const fieldNameMap = {
    'username': 'Username',
    'email': 'Email',
    'password': 'Password',
    'password_confirm': 'Confirm Password',
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'phone': 'Phone Number',
    'institution': 'Institution',
    'non_field_errors': 'General Error'
  };

  return fieldNameMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Format field errors for display in forms
 * @param {Object} fieldErrors - Field errors object
 * @returns {Array} - Array of formatted error messages
 */
export const formatFieldErrors = (fieldErrors) => {
  if (!fieldErrors || typeof fieldErrors !== 'object') {
    return [];
  }

  return Object.entries(fieldErrors).map(([field, error]) => ({
    field,
    displayName: getFieldDisplayName(field),
    message: error
  }));
};

/**
 * Set field errors on Ant Design form
 * @param {Object} form - Ant Design form instance
 * @param {Object} fieldErrors - Field errors object from API
 */
export const setFormFieldErrors = (form, fieldErrors) => {
  if (!form || !fieldErrors || typeof fieldErrors !== 'object') {
    return;
  }

  const formErrors = Object.entries(fieldErrors).map(([field, error]) => ({
    name: field,
    errors: Array.isArray(error) ? error : [error]
  }));

  form.setFields(formErrors);
};

/**
 * Clear all form field errors
 * @param {Object} form - Ant Design form instance
 * @param {Array} fieldNames - Array of field names to clear
 */
export const clearFormFieldErrors = (form, fieldNames = []) => {
  if (!form) return;

  if (fieldNames.length > 0) {
    const clearedFields = fieldNames.map(name => ({ name, errors: [] }));
    form.setFields(clearedFields);
  } else {
    form.resetFields();
  }
};
