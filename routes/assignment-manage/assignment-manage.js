import express from "express";
import assignmentManageController from "../../controllers/assignmentManage/assignmentManage.controller.js";

const router = express.Router();

router.get("/assignment/get-modules/:courseId", assignmentManageController.getAllModuleName);
router.post("/assignment/create", assignmentManageController.createAssignment);
router.post("/assignment/create-file/:assignment_id", assignmentManageController.createAssignmentFile);
router.get("/assignment/get-assignment-info/:courseId", assignmentManageController.getAssignmentInfo);
router.get("/assignment/get-assignment-filepath/:assignment_id", assignmentManageController.getAssignmentFilePaths);
router.delete("/assignment/delete-assignment/:assignment_id", assignmentManageController.deleteAssignment);
router.delete("/assignment/delete-assignment-file/:assignment_id", assignmentManageController.deleteAssignmentFile);
router.get("/assignment/get-assignment-detail/:assignment_id", assignmentManageController.getAssignmentDetail);
router.get("/assignment/get-assignment-submission-filename-path/:assignment_id", assignmentManageController.getAssignmentSubmissionFileNameAndPath);
router.get("/assignment/get-assignment-filename-path/:assignment_id", assignmentManageController.getAssignmentFileNameAndPath);
router.get("/assignment/get-assignment-detail-1/:assignment_id", assignmentManageController.getAssignmentDetail1);
router.post("/assignment/update-assignment/:assignment_id", assignmentManageController.updateAssignment);
router.put("/assignment/update-assignment-file/:assignment_id", assignmentManageController.updateAssignmentFile);
router.get("/assignment/get-assignments/module/:module_id", assignmentManageController.getAssignmentByModule);
router.get('/assignment/get-assignments-and-grades/:courseId/:studentId',assignmentManageController.getAssignmentAndGradeByCourseAndStudentId);

export default router;