import connection from '../../database/dbConnect.js'; // Assuming you have a database connection module

// thiết kế show forum chỉ có các bài post đã đăng (thấy được title, 1 chút nội dung, ngày đăng)
// thiết kế khi show chi tiết của 1 post: đầu tiên phải có tiêu đề lớn 
                                    
const forumManageController = {
    getAllPostsByCourseId: (req, res) => {
        const courseId = req.params.course_id;
        const query = `SELECT p.post_id, p.title, p.content, p.created_date, u.full_name FROM posts p
                        JOIN users u ON u.user_id = p.creator_id 
                        WHERE course_id = ?
                        ORDER BY created_date DESC;`; // sort lại theo thời gian
        connection.query(query, [courseId], (err, result) => {
            if (err) {
                res.status(500).send('Internal server error');
            } else {
                res.status(200).send(result);
            }
        });
    },

    getMyPostByCourseId: (req, res) => {
        const {courseId, creator_id} = req.body;
        const sql = `SELECT p.post_id, p.title, p.content, p.created_date, u.full_name FROM posts p
                        JOIN users u ON u.user_id = p.creator_id 
                        WHERE course_id = ? AND creator_id = ?
                        ORDER BY created_date DESC;`;
        connection.query(sql, [courseId, creator_id], (err, data) => {
            if(err){
                console.error("Error query at getMyPostByCourseId:", err);
                return res.status(500).send("Error executing query getMyPostByCourseId");
            } 
            return res.status(200).json(data);
            
        })
    },

    getPostById: (req, res) => {
        const postId = req.params.post_id;
        const query = `SELECT p.post_id, p.title, p.content, p.created_date, u.full_name FROM posts p
                        JOIN users u ON u.user_id = p.creator_id 
                        WHERE post_id = ?
                        ORDER BY created_date DESC;`;
        connection.query(query, [postId], (err, result) => {
            if (err) {
                res.status(500).send('Internal server error');
            } else {
                res.status(200).send(result);
            }
        });
    },

    createPost: async (req, res) => {
        const { creator_id, course_id, title, content } = req.body;
        const sql = `INSERT INTO posts (creator_id, course_id, title, content) VALUES (?, ?, ?, ?)`;
        const sql2 = `SELECT post_id FROM posts ORDER BY post_id DESC LIMIT 1`
       
        try{
            await connection.promise().query(sql, [creator_id, course_id, title, content]);

            const [rows] = await connection.promise().query(sql2);
            const post_id = rows[0].post_id;

            return res.status(200).json({post_id});
        }catch(err){
            console.error("Error in createPost", err);
            return res.status(500).send("Error executing queries in createPost")
        }
    },
    
    createPostFile: async (req, res) => {
        const postFile = req.body; 
        const sql = `SELECT post_id FROM posts ORDER BY post_id DESC LIMIT 1`;
        const sql2 = `INSERT INTO post_files (post_id, file_name, file_path) VALUES ?`;
        try{
            if(postFile.length > 0){
                const [rows] = await connection.promise().query(sql);
                const post_id = rows[0].post_id;

                const postFileValues = postFile.map(file => [post_id, file.fileName, file.key])
    
                await connection.promise().query(sql2, [postFileValues]);
            }
            return res.status(200).send("Create postFile successfully");
        }catch(err){
            console.error("Error in createPostFile:", err);
            return res.status(500).send("Error executing creating post, file");
        }
    },
    updatePostFile: async (req, res) => {
        const postId = req.params.postId;
        const postFile = req.body;

        const sql = `DELETE FROM post_files WHERE post_id = ?`;
        const sql2 = `INSERT INTO post_files (post_id, file_name, file_path) VALUES ?`;

        try{
            if(postFile.length > 0){
                await connection.promise().query(sql, [postId]);
                const postFileValues = postFile.map(file => [postId, file.fileName, file.key])
                await connection.promise().query(sql2, [postFileValues])
            }
            return res.status(200).send("Update postFile successfully");
        }catch(err){
            console.error("Error in updatePostFile:", err);
            return res.status(500).send("Error executing updating post, file");
        }

    },

    getPostedPostFile: (req, res) => { // lấy các file đính kèm thông báo đã đăng
        const postId = req.params.postId;
        const sql = `SELECT file_name, file_path FROM post_files WHERE post_id = ?`;
        connection.query(sql, [postId], (err, data) => {
            if(err){
                console.error("Error query at getPostedPostedFile: ", err);
                return res.status(500).send("Error executing query getting post files with id")
            }
            return res.status(200).json(data);
        })
    },
    updatePost: (req, res) => {
        const postId = req.params.postId;
        const { title, content } = req.body;
        const query = `UPDATE posts SET title = ?, content = ?, last_modified = CURRENT_TIMESTAMP WHERE post_id = ?`;
        connection.query(query, [title, content, postId], (err, result) => {
            if (err) {
                res.status(500).send('Internal server error');
            } else {
                res.status(200).send('Post updated successfully');
            }
        });
    },

    deletePost: (req, res) => {
        const postId = req.params.postId;
        const query = `DELETE FROM posts WHERE post_id = ?`;
        connection.query(query, [postId], (err, result) => {
            if (err) {
                res.status(500).send('Internal server error');
            } else {
                res.status(200).send('Post deleted successfully');
            }
        });
    },

//   API về các comments 
  getAllCommentsInPost: (req, res) => { // trả về các comments trong 1 bài post
    const postId = req.params.postId;

    const sql = `SELECT 
                    c1.comment_id AS comment_id,
                    c1.post_id AS post_id,
                    c1.creator_id AS creator_id,
                    u1.full_name AS creator_full_name,
                    c1.content AS content,
                    c1.reply_to_comment AS reply_to_comment_id,
                    c1.created_date AS created_date,
                    c1.last_modified AS last_modified,
                    c2.comment_id AS replied_comment_id,
                    c2.creator_id AS replied_creator_id,
                    u2.full_name AS replied_creator_full_name,
                    c2.content AS replied_content,
                    c2.created_date AS replied_created_date,
                    c2.last_modified AS replied_last_modified
                FROM comments c1
                LEFT JOIN comments c2 ON c1.reply_to_comment = c2.comment_id
                LEFT JOIN users u1 ON c1.creator_id = u1.user_id
                LEFT JOIN users u2 ON c2.creator_id = u2.user_id
                WHERE c1.post_id = ?;`
    connection.query(sql, [postId], (err, data) => {
        if(err){
            console.error("Error excuting getAllCommentsInPost", err);
            return res.status(500).send("Error in getAllCommentsInPost");
        }
        return res.status(200).json(data);
    })
  },

  getCommentById: (req, res) => { // lấy comment để hiện reply comment
    const commentId = req.params.commentId;

    const sql = `SELECT c.comment_id, c.content, c.created_date, c.creator_id, u.full_name FROM comments c
                JOIN users u ON c.creator_id = u.user_id
                WHERE c.comment_id = ?;`;
    
    connection.query(sql, [commentId], (err, data) => {
        if(err){
            console.error("Error excuting getCommentById", err);
            return res.status(500).send("Error in getCommentById");
        }
        console.log(data);
        return res.status(200).json(data);
    })
  },

  createComment: (req, res) => {
    const {post_id, creator_id, content, reply_to_comment} = req.body;
    const sql = `INSERT INTO comments (post_id, creator_id, content, reply_to_comment) VALUES (?, ?, ?, ?)`;

    connection.query(sql, [post_id, creator_id, content, reply_to_comment], (err, data) => {
        if(err){
            console.error("Error excuting createComment", err);
            return res.status(500).send("Error in createComment");
        }
        return res.status(200).send("Create comment successfully.")
    })
  }
};

export default forumManageController;