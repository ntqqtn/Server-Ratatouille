import express from 'express';
import forumManageController from '../../controllers/forumManage/forumManage.controller.js';

const router = express.Router();

// Post routes
router.get('/posts/course/:course_id', forumManageController.getAllPostsByCourseId);
router.post('/posts/get-my-post', forumManageController.getMyPostByCourseId);
router.get('/posts/:post_id', forumManageController.getPostById);
router.post('/posts', forumManageController.createPost);
router.put('/posts/:postId', forumManageController.updatePost);
router.delete('/posts/:postId', forumManageController.deletePost);

router.post('/create-post-file', forumManageController.createPostFile)
router.put('/update-post-file/:postId', forumManageController.updatePostFile)
router.get('/posted-post-file/:postId', forumManageController.getPostedPostFile)
// Comment routes
// router.get('/comments/post/:post_id', forumManageController.getAllCommentsByPostId);
// router.post('/comments', forumManageController.createComment);
// router.put('/comments/:comment_id', forumManageController.updateComment);
// router.delete('/comments/:comment_id', forumManageController.deleteComment);

router.get('/get-all-comments-in-post/:postId', forumManageController.getAllCommentsInPost);
router.get('/get-comment-by-id/:commentId', forumManageController.getCommentById);
router.post('/create-comment', forumManageController.createComment);
export default router;