import connection from '../../database/dbConnect.js';

const notiManageController = {
    getAllNotifications: (req, res) => {
        const sql = `SELECT notification_id, title, content, creator_id, created_date  FROM notifications n
                        JOIN users u on u.user_id = n.creator_id 
                        WHERE role = 'admin'
                        ORDER BY created_date DESC;`
        connection.query(sql, (err, data)=>{
            if(err){
                console.error("Error query at getAllNotifications:", err);
                return res.status(500).send("Error executing query all notifications");
            }
            return res.status(200).json(data);
        })
    },

    getAllCourses: (req, res) => {
        const sql = `SELECT DISTINCT course_id, course_name FROM courses;`
        connection.query(sql, (err, data) => {
            if(err){
                console.error("Error query at getAllCourses:", err);
                return res.status(500).send("Error executing query all courses");
            }
            data.unshift({ course_id: 'all', course_name: 'All courses' });
            return res.status(200).json(data);
        })
    },

    getAllAdmins: (req, res) => {
        const sql = `SELECT user_id FROM users WHERE role = 'admin';`
        connection.query(sql, (err, data) => {
            if(err){
                console.error("Error query at getAllAdmins:", err);
                return res.status(500).send("Error executing query all admins");
            }
            return res.status(200).json(data);
        })
    },

    createNewNoti: async (req, res) => {
        const {title, content, createdBy, notifyTo} = req.body;
        let is_global = 0;
    
        if (!Array.isArray(notifyTo) || notifyTo.length === 0 || notifyTo.includes('all')) {
            is_global = 1;
        }
    
        if (!title || !content || !createdBy) {
            return res.status(400).send("Title, content, creator are required.");
        }
    
        const sql = `INSERT INTO notifications (title, content, creator_id, is_global) VALUES (?, ?, ?, ?)`;
        const sql2 = `SELECT notification_id FROM notifications ORDER BY notification_id DESC LIMIT 1`;
        const sql3 = `INSERT INTO notification_courses (notification_id, course_id) VALUES ?`;
        try {
            // Insert notification
            await connection.promise().query(sql, [title, content, createdBy, is_global]);
            
            const [rows] = await connection.promise().query(sql2);
            const notification_id = rows[0].notification_id;

            if (!is_global) {
                const notifyToValue = notifyTo.filter(item => item !== 'all');
                const valueInsert2NotiCourses = notifyToValue.map(to => [notification_id, to]);
    
                // Insert into notification_courses
                await connection.promise().query(sql3, [valueInsert2NotiCourses]);
            }
            
            return res.status(200).json({notification_id});
        } catch (err) {
            console.error("Error in createNewNoti:", err);
            return res.status(500).send("Error executing queries");
        }
    },
    createNotiFile: async (req, res) => {
        const notiFile = req.body; 
        const sql = `SELECT notification_id FROM notifications ORDER BY notification_id DESC LIMIT 1`;
        const sql2 = `INSERT INTO notification_files (notification_id, file_name, file_path) VALUES ?`;
        try{
            if(notiFile.length > 0){
                const [rows] = await connection.promise().query(sql);
                const notification_id = rows[0].notification_id;

                const notiFileValues = notiFile.map(file => [notification_id, file.fileName, file.key])
    
                // Insert into notification_courses
                await connection.promise().query(sql2, [notiFileValues]);
            }
            return res.status(200).send("Create notiFile successfully");
        }catch(err){
            console.error("Error in createNewNoti:", err);
            return res.status(500).send("Error executing creating noti, file");
        }
    },
    updateNotiFile: async (req, res) => {
        const notification_id = req.params.id;
        const notiFile = req.body;

        const sql = `DELETE FROM notification_files WHERE notification_id = ?`;
        const sql2 = `INSERT INTO notification_files (notification_id, file_name, file_path) VALUES ?`;

        try{
            if(notiFile.length > 0){
                await connection.promise().query(sql, [notification_id]);
                const notiFileValues = notiFile.map(file => [notification_id, file.fileName, file.key])
                await connection.promise().query(sql2, [notiFileValues])
            }
            return res.status(200).send("Update notiFile successfully");
        }catch(err){
            console.error("Error in updateNotiFile:", err);
            return res.status(500).send("Error executing updating noti, file");
        }

    },
    updateNotification: async (req, res) => {
        const notification_id = req.params.id;

        const {title, content, createdBy, notifyTo} = req.body;
        let is_global = 0;
    
        if (!Array.isArray(notifyTo) || notifyTo.length === 0 || notifyTo.includes('all')) {
            is_global = 1;
        }
        if (!title || !content || !createdBy) {
            return res.status(400).send("Title, content, creator are required.");
        }
    
        const sql = `UPDATE notifications SET title = ?, content = ?, creator_id = ?, is_global = ? WHERE notification_id = ?`;
        const sql2 = `DELETE FROM notification_courses WHERE notification_id = ?`;
        const sql3 = `INSERT INTO notification_courses (notification_id, course_id) VALUES ?`;
    
        try {
            // Update notification
            await connection.promise().query(sql, [title, content, createdBy, is_global, notification_id]);
            await connection.promise().query(sql2, [notification_id]);

            if (!is_global) {
    
                const notifyToValue = notifyTo.filter(item => item !== 'all');
                const valueInsert2NotiCourses = notifyToValue.map(to => [notification_id, to]);
    
                // Insert into notification_courses
                await connection.promise().query(sql3, [valueInsert2NotiCourses]);
            }
    
            return res.status(200).send("Create new notification successfully");
        } catch (err) {
            console.error("Error in createNewNoti:", err);
            return res.status(500).send("Error executing queries");
        }
    },
    
    getPostedNotiFile: (req, res) => { // lấy các file đính kèm thông báo đã đăng
        const notification_id = req.params.id;
        const sql = `SELECT file_name, file_path FROM notification_files WHERE notification_id = ?`;
        connection.query(sql, [notification_id], (err, data) => {
            if(err){
                console.error("Error query at getPostedNotiFile: ", err);
                return res.status(500).send("Error executing query getting notification files with id")
            }
            return res.status(200).json(data);
        })
    },

    getPostedNotification: (req, res) => {
        const notification_id = req.params.id;
        const sql = "SELECT * FROM notifications  WHERE notification_id = ?;";
        connection.query(sql, [notification_id], (err, data) => {
            if(err){
                console.error("Error query at getPostedNotifications:", err);
                return res.status(500).send("Error executing query getting notification with id");
            }
            return res.status(200).json(data);
        })
    },

    getDetailOfNotification: (req, res) => {
        const notification_id = req.params.id;
        const sql = `SELECT n.title, n.content, u.role, u.full_name, u.email, c.course_name, n.created_date, n.last_modified FROM notifications n
                    LEFT JOIN users u ON n.creator_id = u.user_id
                    LEFT JOIN notification_courses nc ON n.notification_id = nc.notification_id
                    LEFT JOIN courses c ON c.course_id = nc.course_id
                    WHERE n.notification_id = ?;`
        connection.query(sql, [notification_id], (err, data) => {
            if(err){
                console.error("Error query at getDetailOfNotification:", err);
                return res.status(500).send("Error executing query getting detail notification with id");
            }
            return res.status(200).json(data);
        })
    },

    getSelectedCourses: (req, res) => {
        const notification_id = req.params.id;
        const sql = `SELECT nc.course_id, c.course_name FROM notification_courses nc
                    JOIN courses c ON nc.course_id = c.course_id WHERE nc.notification_id = ?;`;
        connection.query(sql, [notification_id], (err, data) => {
            if(err){
                console.error("Error query at getSelectedCourses:", err);
                return res.status(500).send("Error executing query getting selected courses with id");
            }
            return res.status(200).json(data);
        })
    },

    deleteNotification: (req, res) => {
        const notification_id = req.params.id;
        const sql = `DELETE FROM notifications WHERE notification_id = ?;`;
        connection.query(sql, [notification_id], (err, data) => {
            if(err){
                console.error("Error query at deleteNotification", err);
                return res.status(500).send("Error executing query deleting notification with id");
            }
            res.status(200).send("Delete notification succesfully")
        })
    },

    getAllTitleNotification: (req, res) => {
        const input = req.body;
        const sql = `SELECT notification_id, title FROM notifications n
                        JOIN users u on u.user_id = n.creator_id 
                        WHERE role = 'admin' AND n.title LIKE "%?%"
                        ORDER BY created_date DESC;`;
        connection.query(sql, [input], (err, data) => {
            if(err){
                console.error("Error query at getAllTitleNotification", err);
                return res.status(500).send("Error executing query getting all title notification");
            }
            res.status(200).json(data);
        })
        
    },

    // ======================================TEACHER NOTIFICATIONS================================================//

    //Lấy ra các thông báo là global và thông báo được gưỉ đến 1 lớp cụ thể mà GV dạy 
    getAllNotificationsGeneralOfTeacher: (req, res) => {
        const {teacher_id} = req.body;

        const sql = `SELECT DISTINCT n.notification_id, n.title, n.content, n.created_date, u.role
                    FROM notifications n
                    LEFT JOIN notification_courses nc ON n.notification_id = nc.notification_id
                    LEFT JOIN courses c ON nc.course_id = c.course_id
                    LEFT JOIN course_teachers ct ON c.course_id = ct.course_id
                    LEFT JOIN users u ON n.creator_id = u.user_id
                    WHERE (n.is_global = 1 OR ct.teacher_id = ?) 
                    AND u.role = 'admin'
                    ORDER BY n.created_date DESC;`
        connection.query(sql, [teacher_id], (err, data) => {
            if(err){
                console.error("Error query at getAllNotificationsGeneralOfTeacher", err);
                return res.status(500).send("Error executing query getting all notifications general of teacher");
            }
            res.status(200).json(data);
        })
    },

    //Lấy ra tất cả các thông báo mà GV đã đăng 
    getAllPostedNotificationByTeacher: (req, res) => {
        const {teacher_id} = req.body;
        const sql = `SELECT * FROM notifications WHERE creator_id = ? ORDER BY created_date DESC;`;
        connection.query(sql, [teacher_id], (err, data) => {
            if(err){
                console.error("Error query at getAllPostedNotificationByTeacher", err);
                return res.status(500).send("Error executing query getting all posted notifications by teacher");
            }
            res.status(200).json(data);
        })
    },

    //Lấy ra các thông báo là global và thông báo được gưỉ đến 1 lớp cụ thể mà SV học
    getAllNotificationsGeneralOfStudent: (req, res) => {
        const {student_id} = req.body;
        const sql = `SELECT DISTINCT n.notification_id, n.title, n.content, n.created_date, u.role
                    FROM notifications n
                    LEFT JOIN notification_courses nc ON n.notification_id = nc.notification_id
                    LEFT JOIN courses c ON nc.course_id = c.course_id
                    LEFT JOIN course_members cm ON c.course_id = cm.course_id
                    LEFT JOIN users u ON n.creator_id = u.user_id
                    WHERE (n.is_global = 1 OR cm.student_id = ?) 
                    AND u.role = 'admin'
                    ORDER BY n.created_date DESC;`
        connection.query(sql, [student_id], (err, data) => {
            if(err){
                console.error("Error query at getAllNotificationsGeneralOfTeacher", err);
                return res.status(500).send("Error executing query getting all notifications general of teacher");
            }
            res.status(200).json(data);
        })
    },

    // Lấy ra tất cả thông báo mà GV đã gửi tới lớp mà SV học 
    getAllNotificationsCourseOfStudent: (req, res) => {
        const {student_id} = req.body;
        const sql = `SELECT DISTINCT n.notification_id, n.title, n.content, n.created_date, u.role, u.full_name
                    FROM notifications n
                    LEFT JOIN notification_courses nc ON n.notification_id = nc.notification_id
                    LEFT JOIN courses c ON nc.course_id = c.course_id
                    LEFT JOIN course_members cm ON c.course_id = cm.course_id
                    LEFT JOIN users u ON n.creator_id = u.user_id
                    WHERE cm.student_id = ? 
                    AND u.role = 'teacher'
                    ORDER BY n.created_date DESC;`
        connection.query(sql, [student_id], (err, data) => {
            if(err){
                console.error("Error query at getAllNotificationsGeneralOfTeacher", err);
                return res.status(500).send("Error executing query getting all notifications general of teacher");
            }
            res.status(200).json(data);
        })
    },

    // Lấy ra tất cả lớp mà GV dạy
    getAllCoursesOfTeacher: (req, res) => {
        const {teacher_id} = req.body;

        const sql = `SELECT c.course_id, c.course_name FROM course_teachers as ct
                    JOIN courses as c ON c.course_id = ct.course_id 
                    WHERE teacher_id = ?;`;

        connection.query(sql, [teacher_id], (err, data) => {
            if(err){
                console.error("Error query at getAllCoursesOfTeacher", err);
                return res.status(500).send("Error executing query getting all courses of teacher");
            }
            res.status(200).json(data);
        })
    },

    // Lấy ra tất cả lớp học được chọn để gửi thông báo đến của GV (notifyTo của 1 thông báo cụ thể mà GV tạo)
    
}

export default notiManageController;