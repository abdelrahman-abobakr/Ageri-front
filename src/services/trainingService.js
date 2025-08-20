import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

// Course Service - Matching FRONTEND_COURSES_GUIDE.md exactly
class CourseService {
    // Get all courses with optional filters
    static async getCourses(filters = {}) {
        try {

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
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get single course by ID
    static async getCourse(courseId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.TRAINING.COURSE_DETAIL(courseId));
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Create new course (requires authentication)
    static async createCourse(courseData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.TRAINING.COURSES, courseData);
            return response.data;
        } catch (error) {
            const errorData = error.response?.data;
            throw new Error(JSON.stringify(errorData || error.message));
        }
    }

    // Update course (requires authentication)
    static async updateCourse(courseId, courseData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.TRAINING.COURSE_DETAIL(courseId), courseData);
            return response.data;
        } catch (error) {
            const errorData = error.response?.data;
            throw new Error(JSON.stringify(errorData || error.message));
        }
    }

    // Partial update course (requires authentication)
    static async patchCourse(courseId, partialData) {
        try {
            const response = await apiClient.patch(API_ENDPOINTS.TRAINING.COURSE_DETAIL(courseId), partialData);
            return response.data;
        } catch (error) {
            const errorData = error.response?.data;
            throw new Error(JSON.stringify(errorData || error.message));
        }
    }

    // Delete course (requires authentication)
    static async deleteCourse(courseId) {
        try {
            if (!courseId) {
                throw new Error('Course ID is required for deletion');
            }

            const deleteUrl = API_ENDPOINTS.TRAINING.COURSE_DETAIL(courseId);

            const response = await apiClient.delete(deleteUrl);

            return {
                success: true,
                message: 'Course deleted successfully',
                data: response.data
            };
        } catch (error) {
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
            const response = await apiClient.post(API_ENDPOINTS.TRAINING.ENROLL(courseId));
            return response.data;
        } catch (error) {
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
            const response = await apiClient.get('/api/training/enrollments/', { params: filters });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get single enrollment by ID
    static async getEnrollment(enrollmentId) {
        try {
            const response = await apiClient.get(`/api/training/enrollments/${enrollmentId}/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Create new enrollment
    static async createEnrollment(enrollmentData) {
        try {
            const response = await apiClient.post('/api/training/enrollments/', enrollmentData);
            return response.data;
        } catch (error) {
            const errorData = error.response?.data;
            throw new Error(JSON.stringify(errorData || error.message));
        }
    }

    // Update enrollment
    static async updateEnrollment(enrollmentId, enrollmentData) {
        try {
            const response = await apiClient.put(`/api/training/enrollments/${enrollmentId}/`, enrollmentData);
            return response.data;
        } catch (error) {
            const errorData = error.response?.data;
            throw new Error(JSON.stringify(errorData || error.message));
        }
    }

    // Delete enrollment - THIS IS THE MISSING METHOD
    static async deleteEnrollment(enrollmentId) {
        try {
            if (!enrollmentId) {
                throw new Error('Enrollment ID is required for deletion');
            }

            const deleteUrl = `/api/training/enrollments/${enrollmentId}/`;

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

    // Approve enrollment
    static async approveEnrollment(enrollmentId) {
        try {
            const response = await apiClient.patch(`/api/training/enrollments/${enrollmentId}/`, {
                status: 'approved'
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Reject enrollment
    static async rejectEnrollment(enrollmentId) {
        try {
            const response = await apiClient.patch(`/api/training/enrollments/${enrollmentId}/`, {
                status: 'rejected'
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get enrollments for specific course
    static async getCourseEnrollments(courseId) {
        try {
            const response = await apiClient.get(`/training/courses/${courseId}/enrollments/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get my enrollments (for current user)
    static async getMyEnrollments() {
        try {
            const response = await apiClient.get('/training/my-enrollments/');
            return response.data;
        } catch (error) {
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