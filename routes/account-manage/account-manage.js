import express from 'express';
import notiController from '../../controllers/notiManage/notiManage.controller.js';
import accountController from '../../controllers/accountManage/accountManage.controller.js';

const router = express.Router();

router.get('/admin-accounts-teachers', accountController.getAllTeachersAccount);
router.get('/admin-accounts-students', accountController.getAllStudentsAccount);
router.delete("/admin-accounts/delete/:userId", accountController.deleteAccount);
router.get("/admin-accounts/:userId", accountController.getAccountById);
router.put("/admin-accounts/edit/:userId", accountController.updateAccountById);
router.post("/admin-accounts/create", accountController.createAccount);


export default router;