import express from 'express';
import materialManageController from '../../controllers/materialManage/materialManage.controller.js';

const router = express.Router();

router.get('/materials/:course_id', materialManageController.getMaterialsByCourse);
router.get('/material-by-id/:material_id', materialManageController.getMaterialById);
router.post('/materials/add', materialManageController.createMaterial);
router.get('/materials/module/:module_id', materialManageController.getMaterialsByModule);
router.put('/materials/edit/:material_id', materialManageController.updateMaterial);
router.delete('/materials/delete/:material_id', materialManageController.deleteMaterial);
export default router;