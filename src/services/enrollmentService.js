import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

// Enrollment Service - Based on ENROLLMENT_SYSTEM_NO_EMAIL.md
class EnrollmentService {
  // Guest enrollment in course
  static async enrollInCourse(courseId, enrollmentData) {
    try {
      console.log('🔄 Enrolling in course:', courseId);
      console.log('🔄 Enrollment data:', enrollmentData);

      const enrollUrl = API_ENDPOINTS.TRAINING.ENROLL(courseId);
      console.log('🔄 Enrollment URL:', enrollUrl);
      console.log('🔄 Full URL:', `${apiClient.defaults.baseURL}${enrollUrl}`);

      const response = await apiClient.post(enrollUrl, enrollmentData);

      console.log('✅ Enrollment successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Enrollment failed:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      
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

      console.log('✅ Enrollments loaded from backend:', response.data);
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

      // Try backend endpoint first
      try {
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

        console.log('✅ PDF export completed via backend');
        return true;
      } catch (backendError) {
        console.log('⚠️ Backend PDF endpoint not available, using client-side PDF generation');

        // Fallback: Generate PDF on client side
        return await this.generateClientSidePDF(filters);
      }
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      throw error;
    }
  }

  // Client-side PDF generation fallback
  static async generateClientSidePDF(filters = {}) {
    try {
      // Get enrollment data
      const enrollmentData = await this.getEnrollments(filters);
      const enrollments = enrollmentData.results || [];

      // Generate text-based report
      const reportContent = this.generateEnrollmentReport(enrollments, filters);

      // Create downloadable text file (since we don't have PDF library)
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enrollments_report_${new Date().toISOString().split('T')[0]}.txt`;
      link.click();
      URL.revokeObjectURL(url);

      console.log('✅ Client-side report generated');
      return true;
    } catch (error) {
      console.error('❌ Client-side PDF generation failed:', error);
      throw new Error('Failed to generate enrollment report');
    }
  }

  // Generate enrollment report content
  static generateEnrollmentReport(enrollments, filters) {
    const date = new Date().toLocaleDateString('ar-EG');
    const time = new Date().toLocaleTimeString('ar-EG');

    let report = `
تقرير التسجيلات في الدورات التدريبية
=====================================

تاريخ التقرير: ${date}
وقت التقرير: ${time}
عدد التسجيلات: ${enrollments.length}

`;

    if (filters.course_id) {
      report += `مرشح حسب الدورة: ${filters.course_id}\n`;
    }
    if (filters.payment_status) {
      report += `مرشح حسب حالة الدفع: ${filters.payment_status}\n`;
    }
    if (filters.status) {
      report += `مرشح حسب حالة التسجيل: ${filters.status}\n`;
    }

    report += `\n${'='.repeat(80)}\n\n`;

    if (enrollments.length === 0) {
      report += 'لا توجد تسجيلات تطابق المعايير المحددة.\n';
    } else {
      enrollments.forEach((enrollment, index) => {
        // Handle both formatted and raw enrollment data
        const fullName = enrollment.full_name || `${enrollment.first_name} ${enrollment.last_name}`;
        const email = enrollment.participant_email || enrollment.email;
        const enrollmentDate = enrollment.enrollment_date_formatted ||
                              new Date(enrollment.enrollment_date).toLocaleDateString('ar-EG');
        const balanceDue = enrollment.balance_due || (enrollment.amount_due - enrollment.amount_paid);

        report += `${index + 1}. ${fullName}\n`;
        report += `   البريد الإلكتروني: ${email}\n`;
        report += `   الهاتف: ${enrollment.phone || 'غير محدد'}\n`;
        report += `   المسمى الوظيفي: ${enrollment.job_title || 'غير محدد'}\n`;
        report += `   المؤهل العلمي: ${enrollment.education_level || 'غير محدد'}\n`;
        report += `   مستوى الخبرة: ${enrollment.experience_level || 'غير محدد'}\n`;
        report += `   الدورة: ${enrollment.course?.course_name || 'غير محدد'}\n`;
        report += `   كود الدورة: ${enrollment.course?.course_code || 'غير محدد'}\n`;
        report += `   المدرب: ${enrollment.course?.instructor || 'غير محدد'}\n`;
        report += `   تاريخ التسجيل: ${enrollmentDate}\n`;
        report += `   حالة التسجيل: ${this.getStatusLabel(enrollment.status)}\n`;
        report += `   حالة الدفع: ${this.getPaymentStatusLabel(enrollment.payment_status)}\n`;
        report += `   المبلغ المطلوب: ${enrollment.amount_due} جنيه\n`;
        report += `   المبلغ المدفوع: ${enrollment.amount_paid} جنيه\n`;
        report += `   المتبقي: ${balanceDue} جنيه\n`;
        if (enrollment.organization) {
          report += `   المؤسسة: ${enrollment.organization}\n`;
        }
        if (enrollment.enrollment_token) {
          report += `   رقم التسجيل: ${enrollment.enrollment_token}\n`;
        }
        if (enrollment.completion_date) {
          const completionDate = new Date(enrollment.completion_date).toLocaleDateString('ar-EG');
          report += `   تاريخ الإنجاز: ${completionDate}\n`;
        }
        report += `\n${'-'.repeat(50)}\n\n`;
      });
    }

    // Summary statistics
    const totalPaid = enrollments.reduce((sum, e) => sum + (e.amount_paid || 0), 0);
    const totalDue = enrollments.reduce((sum, e) => sum + (e.amount_due || 0), 0);
    const totalBalance = totalDue - totalPaid;

    report += `\nإحصائيات التقرير:\n`;
    report += `================\n`;
    report += `إجمالي التسجيلات: ${enrollments.length}\n`;
    report += `إجمالي المبالغ المطلوبة: ${totalDue} جنيه\n`;
    report += `إجمالي المبالغ المدفوعة: ${totalPaid} جنيه\n`;
    report += `إجمالي المتبقي: ${totalBalance} جنيه\n\n`;

    // Status breakdown
    const statusCounts = {};
    const paymentCounts = {};

    enrollments.forEach(e => {
      statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
      paymentCounts[e.payment_status] = (paymentCounts[e.payment_status] || 0) + 1;
    });

    report += `توزيع حالات التسجيل:\n`;
    Object.entries(statusCounts).forEach(([status, count]) => {
      report += `  ${this.getStatusLabel(status)}: ${count}\n`;
    });

    report += `\nتوزيع حالات الدفع:\n`;
    Object.entries(paymentCounts).forEach(([status, count]) => {
      report += `  ${this.getPaymentStatusLabel(status)}: ${count}\n`;
    });

    report += `\nتم إنشاء التقرير بواسطة نظام إدارة التدريب - ${date}\n`;

    return report;
  }

  // Helper method to get status labels in Arabic
  static getStatusLabel(status) {
    const statusLabels = {
      'pending': 'في الانتظار',
      'approved': 'مقبول',
      'completed': 'مكتمل',
      'cancelled': 'ملغي',
      'rejected': 'مرفوض'
    };
    return statusLabels[status] || status;
  }

  // Helper method to get payment status labels in Arabic
  static getPaymentStatusLabel(status) {
    const paymentLabels = {
      'pending': 'في الانتظار',
      'paid': 'مدفوع',
      'partial': 'دفع جزئي',
      'refunded': 'مسترد',
      'not_required': 'غير مطلوب'
    };
    return paymentLabels[status] || status;
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
