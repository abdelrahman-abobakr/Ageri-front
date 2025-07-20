import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

export const trainingService = {
  // Courses
  getCourses: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.TRAINING.COURSES, { params });
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await apiClient.post(API_ENDPOINTS.TRAINING.COURSES, courseData);
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.TRAINING.COURSE_DETAIL(id));
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await apiClient.put(API_ENDPOINTS.TRAINING.COURSE_DETAIL(id), courseData);
    return response.data;
  },

  partialUpdateCourse: async (id, courseData) => {
    const response = await apiClient.patch(API_ENDPOINTS.TRAINING.COURSE_DETAIL(id), courseData);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.TRAINING.COURSE_DETAIL(id));
    return response.data;
  },

  // Course Enrollment
  enrollInCourse: async (courseId) => {
    const response = await apiClient.post(API_ENDPOINTS.TRAINING.ENROLL(courseId));
    return response.data;
  },

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

  // Enrollments Management
  getEnrollments: async (params = {}) => {
    const response = await apiClient.get('/training/enrollments/', { params });
    return response.data;
  },
};
