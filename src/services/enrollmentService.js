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
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            throw new Error(data?.details || data?.error || 'Invalid enrollment data');
          case 404:
            throw new Error('Course not found');
          default:
            throw new Error(data?.error || `Server error: ${status}`);
        }
      }
      throw error;
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
      const response = await apiClient.get(API_ENDPOINTS.TRAINING.ENROLLMENTS, {
        params: filters
      });
      console.log('✅ Enrollments loaded from backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to load enrollments:', error);
      throw error;
    }
  }

  // Admin: Get enrollment details
  static async getEnrollmentDetails(enrollmentId) {
    try {
      console.log('🔄 ===== FETCHING ENROLLMENT DETAILS =====');
      console.log('🔄 Enrollment ID:', enrollmentId);
      const response = await apiClient.get(
        API_ENDPOINTS.TRAINING.ENROLLMENT_DETAIL(enrollmentId)
      );
      console.log('✅ ===== ENROLLMENT DETAILS SUCCESS =====');
      console.log('✅ Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ===== ENROLLMENT DETAILS ERROR =====');
      console.error('❌ Failed to load enrollment details:', error);
      if (error.response?.status === 404) {
        throw new Error('Enrollment not found');
      }
      throw error;
    }
  }

  // Admin: Update enrollment
  static async updateEnrollment(enrollmentId, updateData) {
    try {
      console.log('🔄 ===== PAYMENT UPDATE REQUEST =====');
      const response = await apiClient.patch(
        API_ENDPOINTS.TRAINING.ENROLLMENT_DETAIL(enrollmentId),
        updateData
      );
      console.log('✅ ===== PAYMENT UPDATE SUCCESS =====');
      return response.data;
    } catch (error) {
      console.error('❌ ===== PAYMENT UPDATE ERROR =====');
      throw error;
    }
  }

  // Admin: Update payment information
  static async updatePayment(enrollmentId, paymentData) {
    return this.updateEnrollment(enrollmentId, paymentData);
  }

  // Admin: Mark enrollment as completed
  static async markCompleted(enrollmentId) {
    try {
      console.log('🔄 Marking enrollment as completed:', enrollmentId);
      const response = await apiClient.post(
        API_ENDPOINTS.TRAINING.MARK_COMPLETED(enrollmentId)
      );
      console.log('✅ Enrollment marked as completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to mark enrollment as completed:', error);
      throw error;
    }
  }

  // Admin: Issue certificate for enrollment
  static async issueCertificate(enrollmentId) {
    try {
      console.log('🔄 Issuing certificate for enrollment:', enrollmentId);
      const response = await apiClient.post(
        API_ENDPOINTS.TRAINING.ISSUE_CERTIFICATE(enrollmentId)
      );
      console.log('✅ Certificate issued:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to issue certificate:', error);
      throw error;
    }
  }

  // Admin: Get enrollment statistics
  static async getEnrollmentStats(filters = {}) {
    try {
      console.log('🔄 Fetching enrollment statistics');
      const response = await apiClient.get(API_ENDPOINTS.TRAINING.ENROLLMENT_STATS, {
        params: filters
      });
      console.log('✅ Enrollment stats loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to load enrollment stats:', error);
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

  // Admin: Export enrollments to PDF
  static async exportEnrollmentsPDF(exportOptions = {}) {
    try {
      console.log('🔄 ===== EXPORTING ENROLLMENTS TO PDF =====');
      return await this.generateEnrollmentsPDF(exportOptions);
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      throw error;
    }
  }

  // Generate PDF using HTML approach (better Unicode support)
  static async generateEnrollmentsPDF(exportOptions = {}) {
    try {
      console.log('🔄 Using HTML-to-PDF approach for better Unicode support');
      
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
        } catch {
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
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #2980b9; margin-bottom: 10px; }
    .info { margin-bottom: 20px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background-color: #2980b9; color: white; padding: 10px; text-align: left; border: 1px solid #ddd; }
    td { padding: 8px; border: 1px solid #ddd; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    tr:hover { background-color: #f5f5f5; }
    .center { text-align: center; }
  </style>
</head>
<body>
  <h1>Enrollments Report - ${courseTitle}</h1>
  <div class="info">
    <p><strong>Export Date:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
    <p><strong>Total Enrollments:</strong> ${enrollments.length}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th class="center">#</th>
        <th>Name</th>
        <th>Email</th>
        <th>Course</th>
        <th>Status</th>
        <th>Payment Status</th>
        <th>Enrolled</th>
      </tr>
    </thead>
    <tbody>
`;

      enrollments.forEach((enrollment, index) => {
        const fullName = enrollment.user
          ? `${enrollment.user.first_name} ${enrollment.user.last_name}`
          : `${enrollment.first_name} ${enrollment.last_name}`;
        const email = enrollment.user?.email || enrollment.email;
        const courseName = enrollment.course?.course_name || 'N/A';
        const status = enrollment.status || 'Pending';
        const paymentStatus = enrollment.payment_status || 'Pending';
        const enrollDate = new Date(enrollment.enrollment_date).toLocaleDateString('ar-EG');

        htmlContent += `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${fullName}</td>
        <td>${email}</td>
        <td>${courseName}</td>
        <td>${status}</td>
        <td>${paymentStatus}</td>
        <td>${enrollDate}</td>
      </tr>
`;
      });

      htmlContent += `
    </tbody>
  </table>
</body>
</html>
`;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
      
      return true;
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw error;
    }
  }
}

export default EnrollmentService;
