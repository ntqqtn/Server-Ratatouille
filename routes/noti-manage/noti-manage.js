import express from 'express';
import notiController from '../../controllers/notiManage/notiManage.controller.js';

const router = express.Router();

router.get('/admin-notifications', notiController.getAllNotifications);
router.get('/admin-course_id-4-noti', notiController.getAllCourses);
router.get('/admin-creator_id-4-noti', notiController.getAllAdmins);
router.post('/admin-create-new-noti', notiController.createNewNoti);
router.get('/admin-posted-noti/:id', notiController.getPostedNotification);
router.get('/admin-selected-courses/:id', notiController.getSelectedCourses);
router.put('/admin-update-noti/:id', notiController.updateNotification);
router.delete('/admin-delete-noti/:id', notiController.deleteNotification);
router.get('/admin-all-title-notification', notiController.getAllTitleNotification);
router.post('/admin-create-noti-file', notiController.createNotiFile);
router.get('/admin-posted-noti-file/:id', notiController.getPostedNotiFile);
router.put('/admin-update-noti-file/:id', notiController.updateNotiFile);
router.get('/detail-noti/:id', notiController.getDetailOfNotification);

router.post('/teacher-general-noti', notiController.getAllNotificationsGeneralOfTeacher);
router.post('/teacher-courses-noti', notiController.getAllPostedNotificationByTeacher);
router.post('/teacher-all-courses', notiController.getAllCoursesOfTeacher);

router.post('/student-general-noti', notiController.getAllNotificationsGeneralOfStudent);
router.post('/student-courses-noti', notiController.getAllNotificationsCourseOfStudent);


export default router;