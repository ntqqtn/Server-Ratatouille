import express from 'express';
import userController from '../../controllers/userManage/userManage.controller.js';

const router = express.Router();

router.post('/register', userController.register);

export default router;