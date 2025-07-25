import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

// Enrollment Service - Based on ENROLLMENT_SYSTEM_NO_EMAIL.md
class EnrollmentService {
  // Guest enrollment in course
  static async enrollInCourse(courseId, enrollmentData) {
    try {
      console.log('🔄 Enrolling in course:', courseId, enrollmentData);
      
      const response = await apiClient.post(
        API_ENDPOINTS.TRAINING.ENROLL(courseId),
        enrollmentData
      );
      
      console.log('✅ Enrollment successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Enrollment failed:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            throw new Error(data?.details || data?.error || 'Invalid enrollment data');
          case 404:
            throw new Error('Course not found');
          case 409:
            throw new Error('Course is full or enrollment deadline passed');
          default:
            throw new Error(data?.error || `Server error: ${status}`);
        }
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  }

  // Look up enrollment by token
  static async lookupEnrollment(enrollmentToken) {
    try {
      console.log('🔍 Looking up enrollment:', enrollmentToken);
      
      const response = await apiClient.get(
        `/training/enrollments/lookup/${enrollmentToken}/`
      );
      
      console.log('✅ Enrollment found:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Enrollment lookup failed:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Enrollment not found. Please check your enrollment ID.');
      }
      
      throw new Error('Failed to lookup enrollment');
    }
  }

  // Get user's enrollments (for authenticated users)
  static async getMyEnrollments() {
    try {
      console.log('🔄 Fetching user enrollments');
      
      const response = await apiClient.get(API_ENDPOINTS.TRAINING.MY_ENROLLMENTS);
      
      console.log('✅ User enrollments loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to load user enrollments:', error);
      throw error;
    }
  }

  // Admin: Get all enrollments with filters
  static async getEnrollments(filters = {}) {
    try {
      console.log('🔄 Fetching enrollments with filters:', filters);
      
      const response = await apiClient.get('/training/admin/enrollments/', {
        params: filters
      });
      
      console.log('✅ Enrollments loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to load enrollments:', error);
      throw error;
    }
  }

  // Admin: Update payment information
  static async updatePayment(enrollmentId, paymentData) {
    try {
      console.log('🔄 Updating payment for enrollment:', enrollmentId, paymentData);
      
      const response = await apiClient.post(
        `/training/admin/enrollments/${enrollmentId}/update_payment/`,
        paymentData
      );
      
      console.log('✅ Payment updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Payment update failed:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        throw new Error(data?.error || `Failed to update payment: ${status}`);
      }
      
      throw new Error('Network error occurred');
    }
  }

  // Admin: Mark enrollment as completed
  static async markCompleted(enrollmentId) {
    try {
      console.log('🔄 Marking enrollment as completed:', enrollmentId);
      
      const response = await apiClient.post(
        `/training/admin/enrollments/${enrollmentId}/mark_completed/`
      );
      
      console.log('✅ Enrollment marked as completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to mark enrollment as completed:', error);
      throw error;
    }
  }

  // Admin: Get enrollment statistics
  static async getEnrollmentStats(filters = {}) {
    try {
      console.log('🔄 Fetching enrollment statistics');
      
      const response = await apiClient.get('/training/admin/enrollments/stats/', {
        params: filters
      });
      
      console.log('✅ Enrollment stats loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to load enrollment stats:', error);
      throw error;
    }
  }

  // Admin: Export enrollments to PDF
  static async exportEnrollmentsPDF(filters = {}) {
    try {
      console.log('🔄 Exporting enrollments to PDF');
      
      const response = await apiClient.get('/training/admin/enrollments/export_pdf/', {
        params: filters,
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enrollments_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF export completed');
      return true;
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      throw error;
    }
  }

  // Admin: Delete enrollment
  static async deleteEnrollment(enrollmentId) {
    try {
      console.log('🔄 Deleting enrollment:', enrollmentId);
      
      const response = await apiClient.delete(
        `/training/admin/enrollments/${enrollmentId}/`
      );
      
      console.log('✅ Enrollment deleted');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete enrollment:', error);
      throw error;
    }
  }

  // Validate enrollment data before submission
  static validateEnrollmentData(data) {
    const errors = {};

    // Required fields
    if (!data.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!data.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Optional but validated fields
    if (data.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Format enrollment data for display
  static formatEnrollmentData(enrollment) {
    return {
      ...enrollment,
      full_name: enrollment.user 
        ? `${enrollment.user.first_name} ${enrollment.user.last_name}`
        : `${enrollment.first_name} ${enrollment.last_name}`,
      participant_email: enrollment.user?.email || enrollment.email,
      enrollment_date_formatted: new Date(enrollment.enrollment_date).toLocaleDateString(),
      completion_date_formatted: enrollment.completion_date 
        ? new Date(enrollment.completion_date).toLocaleDateString() 
        : null,
      payment_date_formatted: enrollment.payment_date 
        ? new Date(enrollment.payment_date).toLocaleDateString() 
        : null,
      balance_due: enrollment.amount_due - enrollment.amount_paid,
      is_fully_paid: enrollment.amount_due === 0 || enrollment.amount_paid >= enrollment.amount_due,
      payment_percentage: enrollment.amount_due === 0 
        ? 100 
        : (enrollment.amount_paid / enrollment.amount_due) * 100
    };
  }
}

export default EnrollmentService;
