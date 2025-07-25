// Test file to verify exports are working correctly
import { CourseService, trainingService } from './services';

console.log('CourseService:', CourseService);
console.log('trainingService:', trainingService);

// Test that CourseService methods exist
console.log('CourseService.getCourses:', typeof CourseService.getCourses);
console.log('CourseService.createCourse:', typeof CourseService.createCourse);

// Test that trainingService methods exist
console.log('trainingService.getCourses:', typeof trainingService.getCourses);
console.log('trainingService.createCourse:', typeof trainingService.createCourse);

export default {};
