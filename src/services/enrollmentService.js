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
      console.log('🔄 Request URL:', `${apiClient.defaults.baseURL}${API_ENDPOINTS.TRAINING.ENROLLMENT_DETAIL(enrollmentId)}`);

      const response = await apiClient.get(
        API_ENDPOINTS.TRAINING.ENROLLMENT_DETAIL(enrollmentId)
      );

      console.log('✅ ===== ENROLLMENT DETAILS SUCCESS =====');
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data (full):', JSON.stringify(response.data, null, 2));
      console.log('✅ Available fields:', Object.keys(response.data));

      // Check for specific fields that might be missing
      const importantFields = [
        'education_level', 'experience_level', 'job_title', 'organization',
        'course', 'course_title', 'course_code', 'instructor',
        'start_date', 'end_date', 'enrollment_date', 'completion_date'
      ];

      console.log('✅ Field availability check:');
      importantFields.forEach(field => {
        const value = response.data[field];
        console.log(`✅ - ${field}:`, value !== undefined ? value : 'MISSING');
      });

      // Special check for course data structure
      console.log('✅ Course data analysis:');
      console.log('✅ - course field type:', typeof response.data.course);
      console.log('✅ - course field value:', response.data.course);
      if (response.data.course && typeof response.data.course === 'object') {
        console.log('✅ - course object keys:', Object.keys(response.data.course));
        console.log('✅ - course object data:', JSON.stringify(response.data.course, null, 2));
      }
      console.log('✅ - course_title:', response.data.course_title);
      console.log('✅ - course_code:', response.data.course_code);

      console.log('✅ ===== END ENROLLMENT DETAILS =====');

      return response.data;
    } catch (error) {
      console.error('❌ ===== ENROLLMENT DETAILS ERROR =====');
      console.error('❌ Failed to load enrollment details:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ ===== END ENROLLMENT DETAILS ERROR =====');

      if (error.response?.status === 404) {
        throw new Error('Enrollment not found');
      }

      throw error;
    }
  }



  // Admin: Update enrollment (including payment information)
  static async updateEnrollment(enrollmentId, updateData) {
    try {
      console.log('🔄 ===== PAYMENT UPDATE REQUEST =====');
      console.log('🔄 Enrollment ID:', enrollmentId);
      console.log('🔄 Update data:', JSON.stringify(updateData, null, 2));
      console.log('🔄 Request URL:', `${apiClient.defaults.baseURL}${API_ENDPOINTS.TRAINING.ENROLLMENT_DETAIL(enrollmentId)}`);
      console.log('🔄 Request method: PATCH');

      // Log the token being used
      const token = localStorage.getItem('access_token');
      console.log('🔄 Token exists:', !!token);
      if (token) {
        console.log('🔄 Token preview:', token.substring(0, 50) + '...');
      }

      const response = await apiClient.patch(
        API_ENDPOINTS.TRAINING.ENROLLMENT_DETAIL(enrollmentId),
        updateData
      );

      console.log('✅ ===== PAYMENT UPDATE SUCCESS =====');
      console.log('✅ Response status:', response.status);
      console.log('✅ Response headers:', response.headers);
      console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
      console.log('✅ ===== END SUCCESS =====');

      return response.data;
    } catch (error) {
      console.error('❌ ===== PAYMENT UPDATE ERROR =====');
      console.error('❌ Error object:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error code:', error.code);

      if (error.response) {
        console.error('❌ Response exists - Status:', error.response.status);
        console.error('❌ Response status text:', error.response.statusText);
        console.error('❌ Response headers:', error.response.headers);
        console.error('❌ Response data (raw):', error.response.data);
        console.error('❌ Response data (stringified):', JSON.stringify(error.response.data, null, 2));

        // Log request details
        if (error.config) {
          console.error('❌ Request config URL:', error.config.url);
          console.error('❌ Request config method:', error.config.method);
          console.error('❌ Request config headers:', error.config.headers);
          console.error('❌ Request config data:', error.config.data);
        }

        const { status, data } = error.response;

        // Try to extract meaningful error message
        let errorMessage = 'Failed to update enrollment';
        if (data) {
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data.detail) {
            errorMessage = data.detail;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.message) {
            errorMessage = data.message;
          } else if (data.non_field_errors) {
            errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors.join(', ') : data.non_field_errors;
          } else {
            // If it's an object with field errors, format them
            const fieldErrors = Object.entries(data)
              .filter(([key, value]) => Array.isArray(value) || typeof value === 'string')
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('; ');

            if (fieldErrors) {
              errorMessage = fieldErrors;
            }
          }
        }

        console.error('❌ Extracted error message:', errorMessage);
        console.error('❌ ===== END ERROR =====');

        throw new Error(`${errorMessage} (Status: ${status})`);
      } else if (error.request) {
        console.error('❌ Request was made but no response received');
        console.error('❌ Request:', error.request);
        console.error('❌ ===== END ERROR =====');
        throw new Error('Network error - no response received');
      } else {
        console.error('❌ Error setting up request:', error.message);
        console.error('❌ ===== END ERROR =====');
        throw new Error('Network error occurred');
      }
    }
  }

  // Admin: Update payment information (alias for backward compatibility)
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

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            throw new Error(data?.error || 'Cannot issue certificate - enrollment not completed or already has certificate');
          case 404:
            throw new Error('Enrollment not found');
          default:
            throw new Error(data?.error || `Failed to issue certificate: ${status}`);
        }
      }

      throw new Error('Network error occurred while issuing certificate');
    }
  }

  // Admin: Get enrollment statistics
  static async getEnrollmentStats(filters = {}) {
    try {
      console.log('🔄 Fetching enrollment statistics');

      // Try the stats endpoint first
      try {
        const response = await apiClient.get(API_ENDPOINTS.TRAINING.ENROLLMENT_STATS, {
          params: filters
        });
        console.log('✅ Enrollment stats loaded:', response.data);
        return response.data;
      } catch (error) {
        // If stats endpoint doesn't exist, calculate from enrollments data
        console.log('📊 Stats endpoint not available, calculating from enrollments data');
        const enrollmentsResponse = await apiClient.get(API_ENDPOINTS.TRAINING.ENROLLMENTS, {
          params: { ...filters, page_size: 1000 } // Get more data for stats
        });

        const enrollments = enrollmentsResponse.data.results || [];
        const stats = this.calculateStatsFromEnrollments(enrollments);
        console.log('✅ Enrollment stats calculated:', stats);
        return stats;
      }
    } catch (error) {
      console.error('❌ Failed to load enrollment stats:', error);
      throw error;
    }
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
      console.log('🔄 Export options:', exportOptions);

      // Always use client-side PDF generation for better control
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

      console.log('🔄 ===== PDF EXPORT DEBUG =====');
      console.log('🔄 Export options received:', exportOptions);

      // Prepare filters for API call
      const filters = {};
      const courseId = exportOptions.course || exportOptions.course_id; // Support both parameter names
      if (courseId && courseId !== '') {
        filters.course = courseId; // Use 'course' parameter as expected by backend
        console.log('🔄 Filtering by course ID:', courseId);
      } else {
        console.log('🔄 No course filter - exporting all courses');
      }

      // Get enrollment data - first get the list, then get details for each
      console.log('🔄 Making API call with filters:', filters);
      const enrollmentData = await this.getEnrollments(filters);
      const enrollmentsList = enrollmentData.results || [];

      console.log('🔄 Fetched enrollment list:', enrollmentsList.length);

      if (enrollmentsList.length === 0) {
        throw new Error('لا توجد بيانات تسجيل للتصدير');
      }

      // Fetch detailed data for each enrollment to get clean data
      console.log('🔄 Fetching detailed data for each enrollment...');
      const enrollments = [];

      for (let i = 0; i < Math.min(enrollmentsList.length, 50); i++) { // Limit to 50 for performance
        const enrollment = enrollmentsList[i];
        try {
          console.log(`🔄 Fetching details for enrollment ${i + 1}/${enrollmentsList.length}`);
          const detailedData = await this.getEnrollmentDetails(enrollment.id);
          enrollments.push(detailedData);
        } catch (error) {
          console.warn(`⚠️ Failed to get details for enrollment ${enrollment.id}, using list data:`, error.message);
          // Fallback to list data if details fetch fails
          enrollments.push(enrollment);
        }
      }

      console.log('🔄 Final enrollment data with details:', enrollments.length);
      console.log('🔄 First detailed enrollment sample:', enrollments[0]);

      // Check if filtering worked (after getting detailed data)
      const expectedCourseId = exportOptions.course || exportOptions.course_id;
      if (expectedCourseId && expectedCourseId !== '') {
        console.log('🔄 Expected course ID:', expectedCourseId);
        console.log('🔄 Actual course IDs in results:', enrollments.map(e => e.course || e.course_id));

        // Manual filter as backup
        const filteredEnrollments = enrollments.filter(enrollment => {
          const enrollmentCourseId = enrollment.course || enrollment.course_id;
          return enrollmentCourseId == expectedCourseId; // Use == for type flexibility
        });

        console.log('🔄 Manual filter result:', filteredEnrollments.length, 'enrollments');

        if (filteredEnrollments.length !== enrollments.length) {
          console.log('⚠️ API filter not working, using manual filter');
          enrollments.length = 0; // Clear array
          enrollments.push(...filteredEnrollments); // Add filtered results
        }
      }

      if (enrollments.length === 0) {
        throw new Error('لا توجد بيانات تسجيل للتصدير');
      }

      // Create HTML table for better Unicode/Arabic support
      const courseTitle = (exportOptions.course || exportOptions.course_id)
        ? enrollments[0]?.course_title || 'Selected Course'
        : 'All Courses';

      console.log('🔄 Creating HTML table with clean data...');

      // Build HTML table with proper encoding
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
            <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Enrollments:</strong> ${enrollments.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th class="center">#</th>
                <th>Name</th>
                <th>Email</th>`;

      // Add conditional headers
      if (!exportOptions.course_id || exportOptions.course_id === '') {
        htmlContent += `<th>Course</th>`;
      }
      if (exportOptions.include_contact) {
        htmlContent += `<th>Phone</th><th>Organization</th>`;
      }
      if (exportOptions.include_status) {
        htmlContent += `<th>Status</th>`;
      }
      if (exportOptions.include_payment) {
        htmlContent += `<th>Payment Status</th><th>Amount</th>`;
      }
      if (exportOptions.include_dates) {
        htmlContent += `<th>Enrolled</th>`;
      }

      htmlContent += `
              </tr>
            </thead>
            <tbody>`;

      // Add table rows
      enrollments.forEach((enrollment, index) => {
        const participantName = enrollment.enrollee_name || enrollment.student_name ||
          `${enrollment.first_name} ${enrollment.last_name}`;
        const email = enrollment.enrollee_email || enrollment.email;

        htmlContent += `
              <tr>
                <td class="center">${index + 1}</td>
                <td>${participantName}</td>
                <td>${email}</td>`;

        // Add conditional columns
        if (!exportOptions.course_id || exportOptions.course_id === '') {
          htmlContent += `<td>${enrollment.course_title || 'N/A'}</td>`;
        }
        if (exportOptions.include_contact) {
          htmlContent += `<td>${enrollment.phone || 'N/A'}</td>`;
          htmlContent += `<td>${enrollment.organization || 'N/A'}</td>`;
        }
        if (exportOptions.include_status) {
          // Use raw status data without processing to avoid corruption
          htmlContent += `<td>${enrollment.status || 'Unknown'}</td>`;
        }
        if (exportOptions.include_payment) {
          // Use raw payment data without processing
          htmlContent += `<td>${enrollment.payment_status || 'Pending'}</td>`;
          htmlContent += `<td>${enrollment.payment_amount || '0'} EGP</td>`;
        }
        if (exportOptions.include_dates) {
          const enrollDate = new Date(enrollment.enrollment_date).toLocaleDateString();
          htmlContent += `<td>${enrollDate}</td>`;
        }

        htmlContent += `</tr>`;
      });

      htmlContent += `
            </tbody>
          </table>
        </body>
        </html>`;

      // Create a new window with the HTML content for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait a moment for content to load, then trigger print dialog
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);

      console.log('✅ HTML table generated and print dialog opened');
      return true;
      doc.setFont(undefined, 'bold');

      columns.forEach(col => {
        doc.text(col.title, col.x + 2, startY + 7);
      });

      // Draw table rows
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);

      let currentY = startY + headerHeight;
      const pageHeight = 200; // Leave space for footer

      enrollments.forEach((enrollment, index) => {
        // Check if we need a new page
        if (currentY > pageHeight) {
          doc.addPage();
          currentY = 20;

          // Redraw header on new page
          doc.setFillColor(41, 128, 185);
          doc.rect(20, currentY, currentX - 20, headerHeight, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont(undefined, 'bold');

          columns.forEach(col => {
            doc.text(col.title, col.x + 2, currentY + 7);
          });

          currentY += headerHeight;
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'normal');
          doc.setFontSize(8);
        }

        // Alternate row colors
        if (index % 2 === 1) {
          doc.setFillColor(245, 245, 245);
          doc.rect(20, currentY, currentX - 20, rowHeight, 'F');
        }

        // Draw cell borders
        doc.setDrawColor(200, 200, 200);
        columns.forEach(col => {
          doc.rect(col.x, currentY, col.width, rowHeight);
        });

        // Add data to cells
        let colIndex = 0;

        // Index
        doc.text((index + 1).toString(), columns[colIndex].x + 2, currentY + 5);
        colIndex++;

        // Name
        const participantName = enrollment.enrollee_name || enrollment.student_name ||
          `${enrollment.first_name} ${enrollment.last_name}`;
        const truncatedName = participantName.length > 25 ? participantName.substring(0, 22) + '...' : participantName;
        doc.text(truncatedName, columns[colIndex].x + 2, currentY + 5);
        colIndex++;

        // Email
        const email = enrollment.enrollee_email || enrollment.email;
        const truncatedEmail = email.length > 30 ? email.substring(0, 27) + '...' : email;
        doc.text(truncatedEmail, columns[colIndex].x + 2, currentY + 5);
        colIndex++;

        // Course (if showing all courses)
        if (!exportOptions.course_id || exportOptions.course_id === '') {
          const courseName = enrollment.course_title || 'N/A';
          const truncatedCourse = courseName.length > 20 ? courseName.substring(0, 17) + '...' : courseName;
          doc.text(truncatedCourse, columns[colIndex].x + 2, currentY + 5);
          colIndex++;
        }

        // Contact info
        if (exportOptions.include_contact) {
          doc.text(enrollment.phone || 'N/A', columns[colIndex].x + 2, currentY + 5);
          colIndex++;
          const org = enrollment.organization || 'N/A';
          const truncatedOrg = org.length > 20 ? org.substring(0, 17) + '...' : org;
          doc.text(truncatedOrg, columns[colIndex].x + 2, currentY + 5);
          colIndex++;
        }

        // Status
        if (exportOptions.include_status) {
          const statusLabel = this.getStatusLabel(enrollment.status);
          console.log(`🔄 Status for ${participantName}: raw="${enrollment.status}" -> clean="${statusLabel}"`);
          doc.text(statusLabel, columns[colIndex].x + 2, currentY + 5);
          colIndex++;
        }

        // Payment
        if (exportOptions.include_payment) {
          // Payment Status
          const paymentStatus = this.getPaymentStatusLabel(enrollment.payment_status);
          console.log(`🔄 Payment for ${participantName}: raw="${enrollment.payment_status}" -> clean="${paymentStatus}"`);
          doc.text(paymentStatus, columns[colIndex].x + 2, currentY + 5);
          colIndex++;

          // Payment Amount
          const amount = enrollment.payment_amount ? `${enrollment.payment_amount} EGP` : '0 EGP';
          doc.text(amount, columns[colIndex].x + 2, currentY + 5);
          colIndex++;
        }

        // Dates
        if (exportOptions.include_dates) {
          const enrollDate = new Date(enrollment.enrollment_date).toLocaleDateString();
          doc.text(enrollDate, columns[colIndex].x + 2, currentY + 5);
          colIndex++;
        }

        currentY += rowHeight;
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 170, 290);
        doc.text('Training Management System - Ageri', 20, 290);
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const courseName = exportOptions.course_id ?
        (enrollments[0]?.course_title || 'course').replace(/[^a-zA-Z0-9]/g, '_') :
        'all_courses';
      const filename = `enrollments_${courseName}_${timestamp}.pdf`;

      // Save the PDF
      doc.save(filename);

      console.log('✅ PDF generated successfully:', filename);
      return true;
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw error;
    }
  }

  // Helper method to detect and fix Arabic encoding issues
  static fixArabicEncoding(text) {
    if (!text) return '';

    // Common Arabic encoding fixes
    const arabicFixes = {
      // UTF-8 to Latin-1 corruption patterns for Arabic
      'Ø§Ù†ØªØ¸Ø§Ø±': 'انتظار', // pending in Arabic
      'Ù…Ø¯Ù�ÙˆØ¹': 'مدفوع',   // paid in Arabic
      'Ù�Ø´Ù„': 'فشل',         // failed in Arabic
      'Ù…Ù‚Ø¨ÙˆÙ„': 'مقبول',   // approved in Arabic
      'Ù…ÙƒØªÙ…Ù„': 'مكتمل',   // completed in Arabic
    };

    // Try to fix known Arabic corruption patterns
    for (const [corrupted, fixed] of Object.entries(arabicFixes)) {
      if (text.includes(corrupted)) {
        console.log('🔧 Fixed Arabic encoding:', corrupted, '->', fixed);
        return fixed;
      }
    }

    return text;
  }

  // Helper method to clean garbled text
  static cleanGarbledText(text) {
    if (!text) return '';

    console.log('🔧 ===== TEXT CLEANING DEBUG =====');
    console.log('🔧 Original text:', text);
    console.log('🔧 Type:', typeof text);
    console.log('🔧 Length:', text.toString().length);
    console.log('🔧 Character codes:', Array.from(text.toString()).map(c => c.charCodeAt(0)));
    console.log('🔧 Hex dump:', Array.from(text.toString()).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '));

    // Convert to string
    let cleaned = text.toString();

    // First, try to fix Arabic encoding issues
    cleaned = this.fixArabicEncoding(cleaned);

    // Check if this looks like corrupted UTF-8 or encoding issues
    const hasGarbledChars = /[þÞðÐ]/g.test(cleaned);
    const hasOnlyWeirdChars = /^[^\w\s\u0600-\u06FF]+$/.test(cleaned); // Include Arabic range
    const isLikelyCorrupted = cleaned.length > 5 && /^[^\x20-\x7E\u0600-\u06FF]+$/.test(cleaned);

    console.log('🔧 Corruption analysis:', {
      hasGarbledChars,
      hasOnlyWeirdChars,
      isLikelyCorrupted,
      containsArabic: /[\u0600-\u06FF]/.test(cleaned)
    });

    if (hasGarbledChars || hasOnlyWeirdChars || isLikelyCorrupted) {
      console.log('🔧 Detected garbled text, attempting to fix...');

      // Try to decode if it's double-encoded or corrupted
      try {
        // Remove common corruption patterns
        cleaned = cleaned.replace(/[þÞðÐ]/g, '');
        cleaned = cleaned.replace(/[^\x20-\x7E\u00A0-\u024F\u0600-\u06FF]/g, ''); // Keep ASCII + Latin + Arabic
        cleaned = cleaned.trim();

        // If still empty or too short, it's probably corrupted beyond repair
        if (!cleaned || cleaned.length < 2) {
          console.log('🔧 Text too corrupted, returning empty');
          return '';
        }
      } catch (e) {
        console.log('🔧 Error cleaning text:', e);
        return '';
      }
    }

    console.log('🔧 Final cleaned result:', cleaned);
    console.log('🔧 ===== END TEXT CLEANING =====');
    return cleaned;
  }

  // Helper method to get status label
  static getStatusLabel(status) {
    const statusLabels = {
      // English
      'pending': 'Pending',
      'approved': 'Approved',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected',
      // Arabic
      'انتظار': 'Pending',
      'مقبول': 'Approved',
      'مكتمل': 'Completed',
      'ملغي': 'Cancelled',
      'مرفوض': 'Rejected'
    };

    console.log('🔧 ===== STATUS PROCESSING =====');
    console.log('🔧 Original status:', status);

    // Clean the status - remove any encoding issues
    const cleanStatus = this.cleanGarbledText(status);
    console.log('🔧 Cleaned status:', cleanStatus);

    // Try both original case and lowercase
    let result = statusLabels[cleanStatus] || statusLabels[cleanStatus.toLowerCase()];

    // If no direct match, try pattern matching
    if (!result && cleanStatus) {
      const lowerClean = cleanStatus.toLowerCase();
      if (lowerClean.includes('pending') || lowerClean.includes('انتظار')) result = 'Pending';
      else if (lowerClean.includes('approved') || lowerClean.includes('مقبول')) result = 'Approved';
      else if (lowerClean.includes('completed') || lowerClean.includes('مكتمل')) result = 'Completed';
      else if (lowerClean.includes('cancelled') || lowerClean.includes('ملغي')) result = 'Cancelled';
      else if (lowerClean.includes('rejected') || lowerClean.includes('مرفوض')) result = 'Rejected';
    }

    // Final fallback
    if (!result) {
      result = cleanStatus || 'Unknown';
    }

    console.log('🔧 Final status result:', result);
    console.log('🔧 ===== END STATUS PROCESSING =====');
    return result;
  }

  // Helper method to get payment status label
  static getPaymentStatusLabel(paymentStatus) {
    const paymentLabels = {
      // English
      'pending': 'Pending',
      'paid': 'Paid',
      'failed': 'Failed',
      'refunded': 'Refunded',
      'unpaid': 'Unpaid',
      'partial': 'Partial',
      // Arabic
      'انتظار': 'Pending',
      'مدفوع': 'Paid',
      'فشل': 'Failed',
      'مسترد': 'Refunded',
      'غير مدفوع': 'Unpaid',
      'جزئي': 'Partial'
    };

    console.log('🔧 ===== PAYMENT STATUS PROCESSING =====');
    console.log('🔧 Original payment status:', paymentStatus);

    // If the data is null, undefined, or clearly corrupted, return default
    if (!paymentStatus || paymentStatus === null || paymentStatus === undefined) {
      console.log('🔧 Payment status is null/undefined, using default');
      return 'Pending';
    }

    // Clean the payment status - remove any encoding issues
    const cleanStatus = this.cleanGarbledText(paymentStatus);
    console.log('🔧 Cleaned payment status:', cleanStatus);

    // Try both original case and lowercase
    let result = paymentLabels[cleanStatus] || paymentLabels[cleanStatus.toLowerCase()];

    // If no direct match, try pattern matching
    if (!result && cleanStatus) {
      const lowerClean = cleanStatus.toLowerCase();
      if (lowerClean.includes('pending') || lowerClean.includes('انتظار')) result = 'Pending';
      else if (lowerClean.includes('paid') || lowerClean.includes('مدفوع')) result = 'Paid';
      else if (lowerClean.includes('failed') || lowerClean.includes('فشل')) result = 'Failed';
      else if (lowerClean.includes('refunded') || lowerClean.includes('مسترد')) result = 'Refunded';
      else if (lowerClean.includes('unpaid') || lowerClean.includes('غير مدفوع')) result = 'Unpaid';
    }

    // Final fallback
    if (!result) {
      console.log('🔧 No match found, using fallback');
      result = cleanStatus || 'Pending';
    }

    console.log('🔧 Final payment status result:', result);
    console.log('🔧 ===== END PAYMENT STATUS PROCESSING =====');
    return result;
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

      const endpoint = API_ENDPOINTS.TRAINING.ENROLLMENT_DETAIL(enrollmentId);
      console.log('🔄 DELETE endpoint:', endpoint);
      console.log('🔄 Full URL:', `${apiClient.defaults.baseURL}${endpoint}`);

      // Check if token exists
      const token = localStorage.getItem('access_token');
      console.log('🔄 Admin token exists:', !!token);
      if (token) {
        console.log('🔄 Token preview:', token.substring(0, 20) + '...');
      }

      const response = await apiClient.delete(endpoint);

      console.log('✅ Enrollment deleted successfully:', response.status);
      console.log('✅ Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete enrollment:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            throw new Error('غير مصرح لك بحذف هذا التسجيل. يرجى تسجيل الدخول كمدير.');
          case 403:
            throw new Error('ليس لديك صلاحية لحذف التسجيلات.');
          case 404:
            throw new Error('التسجيل غير موجود أو تم حذفه مسبقاً.');
          case 500:
            throw new Error('خطأ في الخادم. يرجى المحاولة لاحقاً.');
          default:
            throw new Error(data?.detail || data?.error || `خطأ في الحذف: ${status}`);
        }
      } else if (error.request) {
        throw new Error('خطأ في الشبكة. يرجى التحقق من الاتصال.');
      } else {
        throw new Error(error.message || 'حدث خطأ غير متوقع أثناء الحذف.');
      }
    }
  }

  // Admin: Bulk operations
  static async bulkUpdateStatus(enrollmentIds, status) {
    try {
      console.log('🔄 Bulk updating status for enrollments:', enrollmentIds, 'to:', status);

      const promises = enrollmentIds.map(id =>
        this.updatePayment(id, { status })
      );

      const results = await Promise.allSettled(promises);

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      console.log(`✅ Bulk status update completed: ${successful} successful, ${failed} failed`);

      return {
        successful,
        failed,
        results
      };
    } catch (error) {
      console.error('❌ Bulk status update failed:', error);
      throw error;
    }
  }

  static async bulkDelete(enrollmentIds) {
    try {
      console.log('🔄 Bulk deleting enrollments:', enrollmentIds);

      const promises = enrollmentIds.map(id =>
        this.deleteEnrollment(id)
      );

      const results = await Promise.allSettled(promises);

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      console.log(`✅ Bulk delete completed: ${successful} successful, ${failed} failed`);

      return {
        successful,
        failed,
        results
      };
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
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

  // Test method to verify API connection and authentication
  static async testConnection() {
    try {
      console.log('🔄 Testing API connection and authentication...');

      const token = localStorage.getItem('access_token');
      console.log('🔄 Token exists:', !!token);

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Test with a simple GET request to enrollments
      const response = await apiClient.get(API_ENDPOINTS.TRAINING.ENROLLMENTS, {
        params: { page: 1, page_size: 1 }
      });

      console.log('✅ API connection test successful:', response.status);
      console.log('✅ Response data:', response.data);

      return {
        success: true,
        status: response.status,
        message: 'Connection and authentication successful'
      };
    } catch (error) {
      console.error('❌ API connection test failed:', error);

      return {
        success: false,
        error: error.response?.status || 'Network error',
        message: error.message || 'Connection test failed'
      };
    }
  }
}

export default EnrollmentService;
