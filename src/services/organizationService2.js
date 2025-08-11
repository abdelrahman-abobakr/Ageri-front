// services/organizationService.js

import api from './api';

const organizationService = {
  getDepartments: () => api.get('/organization/departments/'),
  
  getDepartmentLabs: (departmentId) => 
    api.get(`/organization/departments/${departmentId}/labs/`),
  
  getLabResearchers: (labId) => 
    api.get(`/organization/labs/${labId}/researchers/`)
};

export default organizationService;