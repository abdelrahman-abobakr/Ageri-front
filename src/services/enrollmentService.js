import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

// Enrollment Service - Based on ENROLLMENT_SYSTEM_NO_EMAIL.md
class EnrollmentService {
  // Guest enrollment in course
  // Enhanced enrollInCourse method with better error handling
  static async enrollInCourse(courseId, data) {
    try {
      const response = await apiClient.post(`/api/training/courses/${courseId}/enroll/`, data);
      return response.data;
    } catch (error) {
      // Enhance the error object with the response data
      if (error.response) {
        error.responseData = error.response.data;
      }
      throw error;
    }
  }

  // Look up enrollment by token
  static async lookupEnrollment(enrollmentToken) {
    try {
      const response = await apiClient.get(
        `api/training/enrollments/lookup/${enrollmentToken}/`
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Enrollment not found. Please check your enrollment ID.');
      }
      throw new Error('Failed to lookup enrollment');
    }
  }

  // Get user's enrollments (for authenticated users)
  static async getMyEnrollments() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TRAINING.MY_ENROLLMENTS);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all enrollments with filters
  static async getEnrollments(filters = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TRAINING.ENROLLMENTS, {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get enrollment details
  static async getEnrollmentDetails(enrollmentId) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.TRAINING.ENROLLMENT_DETAIL(enrollmentId)
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Enrollment not found');
      }
      throw error;
    }
  }

  // Admin: Update enrollment
  static async updateEnrollment(enrollmentId, updateData) {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.TRAINING.ENROLLMENT_DETAIL(enrollmentId),
        updateData
      );
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      throw new Error(errorData?.message || error.message || 'Failed to update enrollment');
    }
  }

  // Admin: Update payment information
  static async updatePayment(enrollmentId, paymentData) {
    try {
      // Try the payment-specific endpoint first
      try {
        const response = await apiClient.patch(
          `api/training/enrollments/${enrollmentId}/payment/`,
          paymentData
        );
        return response.data;
      } catch (paymentEndpointError) {
        // Fallback to general update endpoint
        return await this.updateEnrollment(enrollmentId, paymentData);
      }
    } catch (error) {
      const errorData = error.response?.data;
      throw new Error(errorData?.message || error.message || 'Failed to update payment information');
    }
  }

  // Admin: Mark enrollment as completed
  static async markCompleted(enrollmentId) {
    try {
      // Try the specific mark completed endpoint first
      try {
        const response = await apiClient.post(
          API_ENDPOINTS.TRAINING.MARK_COMPLETED(enrollmentId)
        );
        return response.data;
      } catch (specificEndpointError) {
        // Fallback to general update
        return await this.updateEnrollment(enrollmentId, { status: 'completed' });
      }
    } catch (error) {
      const errorData = error.response?.data;
      throw new Error(errorData?.message || error.message || 'Failed to mark enrollment as completed');
    }
  }

  // Admin: Delete enrollment - NEW METHOD
  static async deleteEnrollment(enrollmentId) {
    try {
      if (!enrollmentId) {
        throw new Error('Enrollment ID is required for deletion');
      }

      const deleteUrl = API_ENDPOINTS.TRAINING.ENROLLMENT_DETAIL(enrollmentId);
      const response = await apiClient.delete(deleteUrl);

      return {
        success: true,
        message: 'Enrollment deleted successfully',
        data: response.data
      };
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 404:
            throw new Error('Enrollment not found or already deleted');
          case 403:
            throw new Error('You do not have permission to delete this enrollment');
          case 400:
            throw new Error(data?.message || 'Cannot delete enrollment');
          case 409:
            throw new Error('Cannot delete enrollment due to conflicts');
          default:
            throw new Error(data?.message || `Server error: ${status}`);
        }
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  }

  // Admin: Bulk update status - NEW METHOD
  static async bulkUpdateStatus(enrollmentIds, status) {
    try {
      const response = await apiClient.patch('api/training/enrollments/bulk-update/', {
        enrollment_ids: enrollmentIds,
        status: status
      });

      return response.data;
    } catch (error) {
      // Fallback: update each enrollment individually
      let successful = 0;
      let failed = 0;

      for (const enrollmentId of enrollmentIds) {
        try {
          await this.updateEnrollment(enrollmentId, { status });
          successful++;
        } catch (individualError) {
          failed++;
        }
      }

      return { successful, failed };
    }
  }

  // Admin: Bulk delete enrollments - NEW METHOD
  static async bulkDelete(enrollmentIds) {
    try {
      const response = await apiClient.delete('api/training/enrollments/bulk-delete/', {
        data: { enrollment_ids: enrollmentIds }
      });

      return response.data;
    } catch (error) {
      // Fallback: delete each enrollment individually
      let successful = 0;
      let failed = 0;

      for (const enrollmentId of enrollmentIds) {
        try {
          await this.deleteEnrollment(enrollmentId);
          successful++;
        } catch (individualError) {
          failed++;
        }
      }

      return { successful, failed };
    }
  }

  // Admin: Test connection - NEW METHOD
  static async testConnection() {
    try {
      // Try to fetch a small amount of data to test connection
      const response = await apiClient.get('api/training/enrollments/', {
        params: { page: 1, page_size: 1 }
      });

      return {
        success: true,
        message: 'Connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Connection failed'
      };
    }
  }

  // Admin: Issue certificate for enrollment
  static async issueCertificate(enrollmentId) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.TRAINING.ISSUE_CERTIFICATE(enrollmentId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get enrollment statistics
  static async getEnrollmentStats(filters = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TRAINING.ENROLLMENT_STATS, {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Validate enrollment data
  static validateEnrollmentData(data) {
    const errors = {};

    // Validate required fields
    if (!data.first_name || data.first_name.trim().length === 0) {
      errors.first_name = 'الاسم الأول مطلوب';
    }

    if (!data.last_name || data.last_name.trim().length === 0) {
      errors.last_name = 'الاسم الأخير مطلوب';
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'يرجى إدخال بريد إلكتروني صحيح';
      }
    }

    if (!data.experience_level || data.experience_level.trim().length === 0) {
      errors.experience_level = 'مستوى الخبرة مطلوب';
    }

    // Validate phone format if provided
    if (data.phone && data.phone.trim().length > 0) {
      const phoneRegex = /^[\+]?[0-9\s\-()]{7,}$/;
      if (!phoneRegex.test(data.phone)) {
        errors.phone = 'يرجى إدخال رقم هاتف صحيح';
      }
    }

    // Validate education level if provided
    const validEducationLevels = ['high_school', 'bachelor', 'master', 'phd', 'other'];
    if (data.education_level && !validEducationLevels.includes(data.education_level)) {
      errors.education_level = 'المستوى التعليمي غير صحيح';
    }

    // Validate experience level if provided
    const validExperienceLevels = ['beginner', 'intermediate', 'advanced'];
    if (data.experience_level && !validExperienceLevels.includes(data.experience_level)) {
      errors.experience_level = 'مستوى الخبرة غير صحيح';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Helper method to calculate stats from enrollments data
  static calculateStatsFromEnrollments(enrollments) {
    const total = enrollments.length;
    const active = enrollments.filter(e => e.status === 'active').length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const pending = enrollments.filter(e => e.status === 'pending').length;
    return {
      total_enrollments: total,
      active_enrollments: active,
      completed_enrollments: completed,
      pending_enrollments: pending,
      completion_rate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
    };
  }

  // Admin: Export enrollments to PDF - ENHANCED METHOD
  static async exportEnrollmentsPDF(exportOptions = {}) {
    try {
      return await this.generateEnrollmentsPDF(exportOptions);
    } catch (error) {
      throw error;
    }
  }

  // Generate PDF using HTML approach (better Unicode support)
  static async generateEnrollmentsPDF(exportOptions = {}) {
    try {
      const filters = {};
      const courseId = exportOptions.course || exportOptions.course_id;
      if (courseId && courseId !== '') {
        filters.course = courseId;
      }

      const enrollmentData = await this.getEnrollments(filters);
      const enrollmentsList = enrollmentData.results || [];

      if (enrollmentsList.length === 0) {
        throw new Error('لا توجد بيانات تسجيل للتصدير');
      }

      const enrollments = [];
      for (let i = 0; i < Math.min(enrollmentsList.length, 50); i++) {
        const enrollment = enrollmentsList[i];
        try {
          const detailedData = await this.getEnrollmentDetails(enrollment.id);
          enrollments.push(detailedData);
        } catch (detailError) {
          enrollments.push(enrollment);
        }
      }

      if (enrollments.length === 0) {
        throw new Error('لا توجد بيانات تسجيل للتصدير');
      }

      const courseTitle = (exportOptions.course || exportOptions.course_id)
        ? enrollments[0]?.course_title || 'Selected Course'
        : 'All Courses';

      let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Enrollments Report - ${courseTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
    h1 { color: #2980b9; margin-bottom: 10px; text-align: center; }
    .info { margin-bottom: 20px; color: #666; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background-color: #2980b9; color: white; padding: 10px; text-align: center; border: 1px solid #ddd; }
    td { padding: 8px; border: 1px solid #ddd; text-align: center; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    tr:hover { background-color: #f5f5f5; }
    .center { text-align: center; }
    @media print {
      body { margin: 10px; }
      .info { page-break-after: avoid; }
      table { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>تقرير التسجيلات - ${courseTitle}</h1>
  <div class="info">
    <p><strong>تاريخ التصدير:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
    <p><strong>إجمالي التسجيلات:</strong> ${enrollments.length}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th class="center">#</th>
        <th>الاسم</th>
        <th>البريد الإلكتروني</th>`;

      // Add conditional columns based on export options
      if (exportOptions.include_contact) {
        htmlContent += `<th>الهاتف</th>`;
      }

      htmlContent += `<th>الدورة</th>
        <th>حالة التسجيل</th>`;

      if (exportOptions.include_payment) {
        htmlContent += `<th>حالة الدفع</th><th>المبلغ</th>`;
      }

      if (exportOptions.include_dates) {
        htmlContent += `<th>تاريخ التسجيل</th>`;
      }

      htmlContent += `
      </tr>
    </thead>
    <tbody>
`;

      enrollments.forEach((enrollment, index) => {
        const fullName = enrollment.user
          ? `${enrollment.user.first_name} ${enrollment.user.last_name}`
          : `${enrollment.first_name || ''} ${enrollment.last_name || ''}`.trim() || enrollment.enrollee_name || 'غير محدد';
        const email = enrollment.user?.email || enrollment.enrollee_email || enrollment.email || 'غير محدد';
        const phone = enrollment.phone || 'غير محدد';
        const courseName = enrollment.course_title || enrollment.course?.course_name || 'غير محدد';
        const status = enrollment.status === 'completed' ? 'مكتمل' :
          enrollment.status === 'approved' ? 'مقبول' :
            enrollment.status === 'pending' ? 'في الانتظار' : 'مرفوض';
        const paymentStatus = enrollment.payment_status === 'paid' ? 'مدفوع' :
          enrollment.payment_status === 'failed' ? 'فشل' :
            enrollment.payment_status === 'refunded' ? 'مسترد' : 'في الانتظار';
        const paymentAmount = enrollment.payment_amount || '0.00';
        const enrollDate = new Date(enrollment.enrollment_date).toLocaleDateString('ar-EG');

        htmlContent += `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${fullName}</td>
        <td>${email}</td>`;

        if (exportOptions.include_contact) {
          htmlContent += `<td>${phone}</td>`;
        }

        htmlContent += `<td>${courseName}</td>
        <td>${status}</td>`;

        if (exportOptions.include_payment) {
          htmlContent += `<td>${paymentStatus}</td><td>${paymentAmount} جنيه</td>`;
        }

        if (exportOptions.include_dates) {
          htmlContent += `<td>${enrollDate}</td>`;
        }

        htmlContent += `</tr>`;
      });

      htmlContent += `
    </tbody>
  </table>
  <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
    <p>تم إنشاء هذا التقرير بواسطة نظام إدارة التدريب</p>
  </div>
</body>
</html>
`;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then show print dialog
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);

      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default EnrollmentService;