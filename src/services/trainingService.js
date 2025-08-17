import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

// Course Service - Matching FRONTEND_COURSES_GUIDE.md exactly
class CourseService {
    // Get all courses with optional filters
    static async getCourses(filters = {}) {
        try {
            console.log('📄 Fetching courses with filters:', filters);

            const queryParams = new URLSearchParams();

            // Add filters to query params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const url = queryParams.toString()
                ? `${API_ENDPOINTS.TRAINING.COURSES}?${queryParams}`
                : API_ENDPOINTS.TRAINING.COURSES;

            const response = await apiClient.get(url);
            console.log('✅ Courses response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to fetch courses:', error);
            throw error;
        }
    }

    // Get single course by ID
    static async getCourse(courseId) {
        try {
            console.log('📄 Fetching course by ID:', courseId);
            const response = await apiClient.get(API_ENDPOINTS.TRAINING.COURSE_DETAIL(courseId));
            console.log('✅ Course details:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to fetch course:', error);
            throw error;
        }
    }

    // Create new course (requires authentication)
    static async createCourse(courseData) {
        try {
            console.log('📄 Creating course:', courseData);
            const response = await apiClient.post(API_ENDPOINTS.TRAINING.COURSES, courseData);
            console.log('✅ Course created:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to create course:', error);
            const errorData = error.response?.data;
            throw new Error(JSON.stringify(errorData || error.message));
        }
    }

    // Update course (requires authentication)
    static async updateCourse(courseId, courseData) {
        try {
            console.log('📄 Updating course:', courseId, courseData);
            const response = await apiClient.put(API_ENDPOINTS.TRAINING.COURSE_DETAIL(courseId), courseData);
            console.log('✅ Course updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to update course:', error);
            const errorData = error.response?.data;
            throw new Error(JSON.stringify(errorData || error.message));
        }
    }

    // Partial update course (requires authentication)
    static async patchCourse(courseId, partialData) {
        try {
            console.log('📄 Partially updating course:', courseId, partialData);
            const response = await apiClient.patch(API_ENDPOINTS.TRAINING.COURSE_DETAIL(courseId), partialData);
            console.log('✅ Course partially updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to patch course:', error);
            const errorData = error.response?.data;
            throw new Error(JSON.stringify(errorData || error.message));
        }
    }

    // Delete course (requires authentication)
    static async deleteCourse(courseId) {
        try {
            console.log('📄 Deleting course with ID:', courseId);
            console.log('📄 Course ID type:', typeof courseId);

            if (!courseId) {
                throw new Error('Course ID is required for deletion');
            }

            const deleteUrl = API_ENDPOINTS.TRAINING.COURSE_DETAIL(courseId);
            console.log('📄 Delete URL:', deleteUrl);
            console.log('📄 Full URL will be:', `${apiClient.defaults.baseURL}${deleteUrl}`);

            const response = await apiClient.delete(deleteUrl);
            console.log('✅ Course deleted successfully, response:', response);

            return {
                success: true,
                message: 'Course deleted successfully',
                data: response.data
            };
        } catch (error) {
            console.error('❌ Failed to delete course:', error);

            // Enhanced error handling
            if (error.response) {
                // Server responded with error status
                const { status, data } = error.response;

                switch (status) {
                    case 404:
                        throw new Error('Course not found or already deleted');
                    case 403:
                        throw new Error('You do not have permission to delete this course');
                    case 400:
                        throw new Error(data?.message || 'Cannot delete course - it may have enrolled participants');
                    case 409:
                        throw new Error('Cannot delete course due to conflicts (enrolled participants or dependencies)');
                    default:
                        throw new Error(data?.message || `Server error: ${status}`);
                }
            } else if (error.request) {
                // Network error
                throw new Error('Network error - please check your connection');
            } else {
                // Other error
                throw new Error(error.message || 'An unexpected error occurred');
            }
        }
    }

    // Enroll in course (requires authentication)
    static async enrollInCourse(courseId) {
        try {
            console.log('📄 Enrolling in course:', courseId);
            const response = await apiClient.post(API_ENDPOINTS.TRAINING.ENROLL(courseId));
            console.log('✅ Enrolled in course:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to enroll in course:', error);
            const errorData = error.response?.data;
            throw new Error(JSON.stringify(errorData || error.message));
        }
    }
}

// Enrollment Service - NEW CLASS TO HANDLE ENROLLMENTS
class EnrollmentService {
    // Get all enrollments with optional filters
    static async getEnrollments(filters = {}) {
        try {
            console.log('📄 Fetching enrollments with filters:', filters);
            const response = await apiClient.get('/api/training/enrollments/', { params: filters });
            console.log('✅ Enrollments response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to fetch enrollments:', error);
            throw error;
        }
    }

    // Get single enrollment by ID
    static async getEnrollment(enrollmentId) {
        try {
            console.log('📄 Fetching enrollment by ID:', enrollmentId);
            const response = await apiClient.get(`/api/training/enrollments/${enrollmentId}/`);
            console.log('✅ Enrollment details:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to fetch enrollment:', error);
            throw error;
        }
    }

    // Create new enrollment
    static async createEnrollment(enrollmentData) {
        try {
            console.log('📄 Creating enrollment:', enrollmentData);
            const response = await apiClient.post('/api/training/enrollments/', enrollmentData);
            console.log('✅ Enrollment created:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to create enrollment:', error);
            const errorData = error.response?.data;
            throw new Error(JSON.stringify(errorData || error.message));
        }
    }

    // Update enrollment
    static async updateEnrollment(enrollmentId, enrollmentData) {
        try {
            console.log('📄 Updating enrollment:', enrollmentId, enrollmentData);
            const response = await apiClient.put(`/api/training/enrollments/${enrollmentId}/`, enrollmentData);
            console.log('✅ Enrollment updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to update enrollment:', error);
            const errorData = error.response?.data;
            throw new Error(JSON.stringify(errorData || error.message));
        }
    }

    // Delete enrollment - THIS IS THE MISSING METHOD
    static async deleteEnrollment(enrollmentId) {
        try {
            console.log('📄 Deleting enrollment with ID:', enrollmentId);
            console.log('📄 Enrollment ID type:', typeof enrollmentId);

            if (!enrollmentId) {
                throw new Error('Enrollment ID is required for deletion');
            }

            const deleteUrl = `/api/training/enrollments/${enrollmentId}/`;
            console.log('📄 Delete URL:', deleteUrl);

            const response = await apiClient.delete(deleteUrl);
            console.log('✅ Enrollment deleted successfully, response:', response);

            return {
                success: true,
                message: 'Enrollment deleted successfully',
                data: response.data
            };
        } catch (error) {
            console.error('❌ Failed to delete enrollment:', error);

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

    // Approve enrollment
    static async approveEnrollment(enrollmentId) {
        try {
            console.log('📄 Approving enrollment:', enrollmentId);
            const response = await apiClient.patch(`/api/training/enrollments/${enrollmentId}/`, {
                status: 'approved'
            });
            console.log('✅ Enrollment approved:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to approve enrollment:', error);
            throw error;
        }
    }

    // Reject enrollment
    static async rejectEnrollment(enrollmentId) {
        try {
            console.log('📄 Rejecting enrollment:', enrollmentId);
            const response = await apiClient.patch(`/api/training/enrollments/${enrollmentId}/`, {
                status: 'rejected'
            });
            console.log('✅ Enrollment rejected:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to reject enrollment:', error);
            throw error;
        }
    }

    // Get enrollments for specific course
    static async getCourseEnrollments(courseId) {
        try {
            console.log('📄 Fetching enrollments for course:', courseId);
            const response = await apiClient.get(`/training/courses/${courseId}/enrollments/`);
            console.log('✅ Course enrollments:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to fetch course enrollments:', error);
            throw error;
        }
    }

    // Get my enrollments (for current user)
    static async getMyEnrollments() {
        try {
            console.log('📄 Fetching my enrollments');
            const response = await apiClient.get('/training/my-enrollments/');
            console.log('✅ My enrollments:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to fetch my enrollments:', error);
            throw error;
        }
    }
}

// Export the services
export { CourseService, EnrollmentService };

// Legacy export for backward compatibility
export const trainingService = {
    getCourses: CourseService.getCourses,
    createCourse: CourseService.createCourse,
    getCourseById: CourseService.getCourse,
    updateCourse: CourseService.updateCourse,
    partialUpdateCourse: CourseService.patchCourse,
    deleteCourse: CourseService.deleteCourse,
    enrollInCourse: CourseService.enrollInCourse,

    // Additional enrollment methods
    unenrollFromCourse: async (courseId) => {
        const response = await apiClient.post(API_ENDPOINTS.TRAINING.UNENROLL(courseId));
        return response.data;
    },

    getCourseEnrollments: async (courseId) => {
        const response = await apiClient.get(API_ENDPOINTS.TRAINING.COURSE_ENROLLMENTS(courseId));
        return response.data;
    },

    getMyEnrollments: async () => {
        const response = await apiClient.get(API_ENDPOINTS.TRAINING.MY_ENROLLMENTS);
        return response.data;
    },

    // Summer Training Programs
    getSummerPrograms: async (params = {}) => {
        const response = await apiClient.get(API_ENDPOINTS.TRAINING.SUMMER_PROGRAMS, { params });
        return response.data;
    },

    createSummerProgram: async (programData) => {
        const response = await apiClient.post(API_ENDPOINTS.TRAINING.SUMMER_PROGRAMS, programData);
        return response.data;
    },

    getSummerProgramById: async (id) => {
        const response = await apiClient.get(API_ENDPOINTS.TRAINING.SUMMER_PROGRAM_DETAIL(id));
        return response.data;
    },

    updateSummerProgram: async (id, programData) => {
        const response = await apiClient.put(API_ENDPOINTS.TRAINING.SUMMER_PROGRAM_DETAIL(id), programData);
        return response.data;
    },

    deleteSummerProgram: async (id) => {
        const response = await apiClient.delete(API_ENDPOINTS.TRAINING.SUMMER_PROGRAM_DETAIL(id));
        return response.data;
    },

    // Public Services
    getPublicServices: async (params = {}) => {
        const response = await apiClient.get(API_ENDPOINTS.TRAINING.PUBLIC_SERVICES, { params });
        return response.data;
    },

    requestPublicService: async (serviceData) => {
        const response = await apiClient.post(API_ENDPOINTS.TRAINING.PUBLIC_SERVICES, serviceData);
        return response.data;
    },

    getPublicServiceById: async (id) => {
        const response = await apiClient.get(API_ENDPOINTS.TRAINING.PUBLIC_SERVICE_DETAIL(id));
        return response.data;
    },

    // Training Sessions
    getTrainingSessions: async (params = {}) => {
        const response = await apiClient.get('/training/sessions/', { params });
        return response.data;
    },

    createTrainingSession: async (sessionData) => {
        const response = await apiClient.post('/training/sessions/', sessionData);
        return response.data;
    },

    // Enrollments Management - Updated to use EnrollmentService
    getEnrollments: EnrollmentService.getEnrollments,
    createEnrollment: EnrollmentService.createEnrollment,
    updateEnrollment: EnrollmentService.updateEnrollment,
    deleteEnrollment: EnrollmentService.deleteEnrollment,
    approveEnrollment: EnrollmentService.approveEnrollment,
    rejectEnrollment: EnrollmentService.rejectEnrollment,
};

// Default export
export default trainingService;