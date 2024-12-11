import express from "express";
var router = express.Router();
import authRouter from "./auth/auth.js";
import courseManageRouter from "./course-manage/course-manage.js";
import notiManageRouter from "./noti-manage/noti-manage.js";
import fileManageRouter from "./file-manage/file-manage.js";    
import accountManageRouter from "./account-manage/account-manage.js";
import moduleManageRouter from "./module-manage/module-manage.js";
import materialManageRouter from "./material-manage/material-manage.js";
import forumanageRouter from "./forum-manage/forum-manage.js";

router.use(accountManageRouter);
router.use(authRouter);
router.use(courseManageRouter);
router.use(notiManageRouter);
router.use(fileManageRouter);
router.use(moduleManageRouter);
router.use(materialManageRouter);
router.use(forumanageRouter);

export default router;