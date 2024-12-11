import express from 'express';
import courseManageController from '../../controllers/courseManage/courseManage.controller.js';

const router = express.Router();

router.get('/courses', courseManageController.getAllCourses);
router.post('/courses/add', courseManageController.createCourse);
router.get('/teachers', courseManageController.getAllTeachers);
router.get('/students', courseManageController.getAllStudents);
router.get('/terms', courseManageController.getAllTerms);
router.get('/courses/:course_id', courseManageController.getCourseById);
router.put('/courses/:course_id', courseManageController.updateCourse);
router.delete('/courses/:course_id', courseManageController.deleteCourse);

router.get('/users-courses/:user_id', courseManageController.getLoginedUsersCourses);

router.post('/courses-in-term-teacher', courseManageController.getCoursesInTermOfTeacher);

router.post('/courses-in-term-student', courseManageController.getCoursesInTermOfStudent);
router.get('/courses/get-member-by-id-course/:course_id', courseManageController.getAllMembersOfCourseById);
router.get('/courses/get-teacher-by-id-course/:course_id', courseManageController.getTeachersOfCourseById);
router.get('/courses/get-student-by-id-course/:course_id', courseManageController.getStudentsOfCourseById);
router.delete('/courses/delete-member/:course_id/:user_id', courseManageController.deleteMemberFromCourse);
router.post('/courses/add-member/:course_id', courseManageController.addMemberToCourse);

export default router;