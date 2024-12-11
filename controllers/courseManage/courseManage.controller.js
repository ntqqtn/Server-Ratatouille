import connection from "../../database/dbConnect.js";

const courseManageController = {
    getAllCourses: (req, res) => {
        const query = `
            SELECT 
                c.course_id, 
                c.course_name, 
                c.classroom, 
                t.term_name, 
                GROUP_CONCAT(u.full_name SEPARATOR ', ') AS teachers,
                (SELECT COUNT(*) FROM course_members WHERE course_id = c.course_id) AS total_students
            FROM courses c
            LEFT JOIN terms t ON c.term_id = t.term_id
            LEFT JOIN course_teachers ct ON c.course_id = ct.course_id
            LEFT JOIN users u ON ct.teacher_id = u.user_id
            GROUP BY c.course_id
        `;
        connection.query(query, (err, results) => {
            if (err) {
                console.log('Error executing query:', err);
                return res.status(500).send('Error executing query all courses');
            }
            res.status(200).json(results);
        });
    },

    getAllTeachers: (req, res) => {
        const query = `
            SELECT user_id, full_name, email, role
            FROM users
            WHERE role = 'teacher'
        `;
        connection.query(query, (err, results) => {
            if (err) {
                console.log('Error executing query:', err);
                return res.status(500).send('Error executing query all teachers');
            }
            res.status(200).json(results);
        });
    }, 

    getAllStudents: (req, res) => {
        const query = `
            SELECT user_id, full_name, email, role
            FROM users
            WHERE role = 'student'
        `;
        connection.query(query, (err, results) => {
            if (err) {
                console.log('Error executing query:', err);
                return res.status(500).send('Error executing query all students');
            }
            res.status(200).json(results);
        });
    },

    createCourse: (req, res) => {
        const { course_id, course_name, classroom, term_id, teachers, students } = req.body;
    
        // Khởi tạo query cho bảng courses
        const courseQuery = `INSERT INTO courses (course_id, course_name, classroom, term_id) VALUES (?, ?, ?, ?)`;
    
        // Khởi tạo query cho bảng course_teachers
        const teacherQuery = `INSERT INTO course_teachers (course_id, teacher_id) VALUES (?, ?)`;
    
        // Khởi tạo query cho bảng course_members
        const studentQuery = `INSERT INTO course_members (course_id, student_id) VALUES (?, ?)`;
    
        connection.beginTransaction((err) => {
            if (err) {
                console.log('Transaction start error:', err);
                return res.status(500).send('Failed to start transaction');
            }
    
            // Thêm khóa học vào bảng courses
            connection.query(courseQuery, [course_id, course_name, classroom, term_id], (err, results) => {
                if (err) {
                    console.log('Error inserting course:', err);
                    return connection.rollback(() => {
                        res.status(500).send('Error inserting course');
                    });
                }
    
                // Thêm giáo viên vào bảng course_teachers
                const teacherPromises = teachers.map((teacherId) =>
                    new Promise((resolve, reject) => {
                        connection.query(teacherQuery, [course_id, teacherId], (err) => {
                            if (err) return reject(err);
                            resolve();
                        });
                    })
                );
    
                // Thêm học sinh vào bảng course_members
                const studentPromises = students.map((studentId) =>
                    new Promise((resolve, reject) => {
                        connection.query(studentQuery, [course_id, studentId], (err) => {
                            if (err) return reject(err);
                            resolve();
                        });
                    })
                );
    
                // Chạy tất cả các promises
                Promise.all([...teacherPromises, ...studentPromises])
                    .then(() => {
                        connection.commit((err) => {
                            if (err) {
                                console.log('Transaction commit error:', err);
                                return connection.rollback(() => {
                                    res.status(500).send('Failed to commit transaction');
                                });
                            }
                            res.status(201).send('Course created successfully');
                        });
                    })
                    .catch((err) => {
                        console.log('Error inserting teachers/students:', err);
                        connection.rollback(() => {
                            res.status(500).send('Error inserting teachers or students');
                        });
                    });
            });
        });
    },
    
    getAllTerms: (req, res) => {
        const query = `
            SELECT *
            FROM terms
        `;
        connection.query(query, (err, results) => {
            if (err) {
                console.log('Error executing query:', err);
                return res.status(500).send('Error executing query all terms');
            }
            res.status(200).json(results);
        });
    }, 

    getCourseById: async (req, res) => {
        const { course_id } = req.params;
        try {
            const courseQuery = `
                SELECT c.course_id, c.course_name, c.classroom, c.term_id, t.term_name
                FROM courses c
                LEFT JOIN terms t ON c.term_id = t.term_id
                WHERE c.course_id = ?
            `;
            const teacherQuery = `
                SELECT u.user_id, u.full_name, u.role
                FROM course_teachers ct
                JOIN users u ON ct.teacher_id = u.user_id
                WHERE ct.course_id = ?
            `;

            const studentQuery = `
                SELECT u.user_id, u.full_name, u.role
                FROM course_members cm
                JOIN users u ON cm.student_id = u.user_id
                WHERE cm.course_id = ?
            `;

            const [courseResults] = await connection.promise().query(courseQuery, [course_id]);
            if (courseResults.length === 0) {
                return res.status(404).send('Course not found');
            }
            const course = courseResults[0];
            //fetch teachers and students in parallel
            const [teachers, students] = await Promise.all([
                connection.promise().query(teacherQuery, [course_id]),
                connection.promise().query(studentQuery, [course_id]),
            ]);

            course.teachers = teachers[0];
            course.students = students[0];
            
            res.status(200).json(course);
        } catch (err) {
            console.error('Error fetching course details', err);
            res.status(500).send('Internal server error');
        }
    },

    updateCourse: async (req, res) => {
        const { course_id } = req.params;
        const { course_name, classroom, term_id, teachers, students } = req.body;

        try {
            // Bắt đầu giao dịch
            await connection.promise().query('START TRANSACTION');

            // Cập nhật thông tin khóa học
            const updateCourseQuery = `
                UPDATE courses
                SET course_name = ?, classroom = ?, term_id = ?
                WHERE course_id = ?
            `;
            const [updateResult] = await connection.promise().query(updateCourseQuery, [course_name, classroom, term_id, course_id]);
            if (updateResult.affectedRows === 0) {
                await connection.promise().query('ROLLBACK');
                return res.status(404).send('Course not found');
            }

            // Xóa và thêm giáo viên
            await connection.promise().query(`DELETE FROM course_teachers WHERE course_id = ?`, [course_id]);
            if (teachers && teachers.length > 0) {
                const teacherValues = teachers.map((id) => [course_id, id]);
                await connection.promise().query(`INSERT INTO course_teachers (course_id, teacher_id) VALUES ?`, [teacherValues]);
            }

            // Xóa và thêm học sinh
            await connection.promise().query(`DELETE FROM course_members WHERE course_id = ?`, [course_id]);
            if (students && students.length > 0) {
                const studentValues = students.map((id) => [course_id, id]);
                await connection.promise().query(`INSERT INTO course_members (course_id, student_id) VALUES ?`, [studentValues]);
            }

            // Commit giao dịch
            await connection.promise().query('COMMIT');
            res.status(200).send('Course updated successfully');
        } catch (err) {
            console.error('Error updating course:', err);
            await connection.promise().query('ROLLBACK');
            res.status(500).send('Failed to update course');
        }
    },

    deleteCourse: async (req, res) => {
        const { course_id } = req.params;

        try {
            await connection.promise().query('START TRANSACTION');

            const checkCourseQuery = 'SELECT * FROM courses WHERE course_id = ?';
            const [courseResult] = await connection.promise().query(checkCourseQuery, [course_id]);
            if (courseResult.length === 0) {
                await connection.promise().query('ROLLBACK');
                return res.status(404).send('Course not found');
            }

            // Xóa thông tin giáo viên khỏi bảng course_teachers
            await connection.promise().query('DELETE FROM course_teachers WHERE course_id = ?', [course_id]);

            // Xóa thông tin học sinh khỏi bảng course_members
            await connection.promise().query('DELETE FROM course_members WHERE course_id = ?', [course_id]);

            // Xóa khóa học khỏi bảng courses
            await connection.promise().query('DELETE FROM courses WHERE course_id = ?', [course_id]);

            // Commit giao dịch
            await connection.promise().query('COMMIT');
            res.status(200).send('Course deleted successfully');

        } catch (error) {
            console.error('Error deleting course:', err);
            await connection.promise().query('ROLLBACK');
            res.status(500).send('Failed to delete course');
        }
    },

    getLoginedUsersCourses: (req, res) => {
        const { user_id } = req.params;
        const query = `
            SELECT 
            c.course_id,
            c.course_name,
            t.term_id,
            t.term_name,
                CASE 
                    WHEN cm.student_id IS NOT NULL THEN 'Student'
                    WHEN ct.teacher_id IS NOT NULL THEN 'Teacher'
                END AS enrolled_as
            FROM courses c
            LEFT JOIN course_members cm ON c.course_id = cm.course_id AND cm.student_id = ?
            LEFT JOIN course_teachers ct ON c.course_id = ct.course_id AND ct.teacher_id = ?
            JOIN terms t ON c.term_id = t.term_id
            WHERE cm.student_id IS NOT NULL OR ct.teacher_id IS NOT NULL;
        `;
    
        connection.query(query, [user_id, user_id], (err, results) => {
            if (err) {
                console.log('Error fetching user courses:', err);
                return res.status(500).send('Error fetching user courses');
            }
            res.status(200).json(results);
        });
    },
    
    // Lấy ra tất cả khóa trong 1 học kỳ của GV
    getCoursesInTermOfTeacher: (req, res) => {
        const date = new Date();
        const month = date.getMonth();
        let term_id;
        if(month >= 1 && month <= 6){
            term_id = (date.getFullYear() - 1).toString().slice(2, 4) +(date.getFullYear()).toString().slice(2, 4) + "II"
        }else if(month === 7 || month === 8){
            term_id = (date.getFullYear() - 1).toString().slice(2, 4) +(date.getFullYear()).toString().slice(2, 4) + "H"
        }else{
            term_id = (date.getFullYear()).toString().slice(2, 4) +(date.getFullYear() + 1).toString().slice(2, 4) + "I"
        }
        const { teacher_id } = req.body
        const sql = `SELECT c.course_name, c.course_id, t.term_name FROM courses as c
                    JOIN course_teachers as ct ON c.course_id = ct.course_id
                    JOIN terms as t ON c.term_id = t.term_id
                    WHERE ct.teacher_id = ? AND c.term_id = ?;`
        
        connection.query(sql, [teacher_id, term_id], (err, data) => {
            if(err){
                console.err("Error query at getCoursesInTermOfTeacher", err);
                return res.status(500).send("Error executing query getCoursesInTermOfTeacher");
            }
            return res.status(200).json(data);
        })
        // check laị getyear là dạng số hay string sửa lại, sau đó chỉnh lại xét if else cộng thêm mà kỳ 
    },
    // Lấy ra tất cả khóa trong 1 học kỳ của GV
    getCoursesInTermOfStudent: (req, res) => {
        const date = new Date();
        const month = date.getMonth();
        let term_id;
        if(month >= 1 && month <= 6){
            term_id = (date.getFullYear() - 1).toString().slice(2, 4) +(date.getFullYear()).toString().slice(2, 4) + "II"
        }else if(month === 7 || month === 8){
            term_id = (date.getFullYear() - 1).toString().slice(2, 4) +(date.getFullYear()).toString().slice(2, 4) + "H"
        }else{
            term_id = (date.getFullYear()).toString().slice(2, 4) +(date.getFullYear() + 1).toString().slice(2, 4) + "I"
        }
        const { student_id } = req.body
        const sql = `SELECT c.course_name, c.course_id, t.term_name FROM courses as c
                    JOIN course_members as cm ON c.course_id = cm.course_id
                    JOIN terms as t ON c.term_id = t.term_id
                    WHERE cm.student_id = ? AND c.term_id = ?;`
        
        connection.query(sql, [student_id, term_id], (err, data) => {
            if(err){
                console.err("Error query at getCoursesInTermOfTeacher", err);
                return res.status(500).send("Error executing query getCoursesInTermOfTeacher");
            }
            return res.status(200).json(data);
        })
        // check laị getyear là dạng số hay string sửa lại, sau đó chỉnh lại xét if else cộng thêm mà kỳ 
    },

    getAllMembersOfCourseById: (req, res) => {
        const {course_id} = req.params;
        const query = `SELECT 
        c.student_id AS id, 
        c.course_id, 
        u.full_name, 
        u.role, 
        co.course_name
    FROM course_members c
    JOIN courses co ON c.course_id = co.course_id
    JOIN users u ON u.user_id = c.student_id
    WHERE c.course_id = ?
    
    UNION ALL
    
    SELECT 
        c.teacher_id AS id, 
        c.course_id, 
        u.full_name, 
        u.role, 
        co.course_name
    FROM course_teachers c
    JOIN courses co ON c.course_id = co.course_id
    JOIN users u ON u.user_id = c.teacher_id
    WHERE c.course_id = ?
    ORDER BY full_name;`;
    
    connection.query(query, [course_id, course_id], (err, results) => {
        if (err) {
            console.log('Error fetching user courses:', err);
            return res.status(500).send('Error fetching user courses');
        }
        res.status(200).json(results);
    });
    },

    getTeachersOfCourseById: (req, res) => {
        const {course_id} = req.params;
        const query = `
        SELECT 
        c.teacher_id AS id, 
        c.course_id, 
        u.full_name, 
        u.role, 
        co.course_name
    FROM course_teachers c
    JOIN courses co ON c.course_id = co.course_id
    JOIN users u ON u.user_id = c.teacher_id
    WHERE c.course_id = ?
    ORDER BY full_name;`;
    
    connection.query(query, [course_id], (err, results) => {
        if (err) {
            console.log('Error fetching user courses:', err);
            return res.status(500).send('Error fetching user courses');
        }
        res.status(200).json(results);
    });
    },

    getStudentsOfCourseById: (req, res) => {
        const {course_id} = req.params;
        const query = `
        SELECT 
        c.student_id AS id, 
        c.course_id, 
        u.full_name, 
        u.role, 
        co.course_name
    FROM course_members c
    JOIN courses co ON c.course_id = co.course_id
    JOIN users u ON u.user_id = c.student_id
    WHERE c.course_id = ?
    ORDER BY full_name;`;
    
    connection.query(query, [course_id], (err, results) => {
        if (err) {
           console.log('Error fetching user courses:', err);
            return res.status(500).send('Error fetching user courses');
        }
        res.status(200).json(results);
    });
    },

    deleteMemberFromCourse: (req, res) => {
        const { course_id, user_id } = req.params; 
        const { role } = req.body; 

        let query = '';
        if (role === 'student') {
            query = `DELETE FROM course_members WHERE course_id = ? AND student_id = ?`;
        } else if (role === 'teacher') {
            query = `DELETE FROM course_teachers WHERE course_id = ? AND teacher_id = ?`;
        } else {
            return res.status(400).send('Invalid role. Role must be either "student" or "teacher".');
        }

        connection.query(query, [course_id, user_id], (err, results) => {
            if (err) {
                console.log('Error deleting member:', err);
                return res.status(500).send('Error deleting member');
            }
            if (results.affectedRows === 0) {
                return res.status(404).send('No member found to delete');
            }
            res.status(200).send('Member successfully deleted');
        });
    },

    addMemberToCourse: (req, res) => {
        const { course_id } = req.params;
        const { email } = req.body;
    
        try {
            // Lấy user_id từ email trong bảng users
            const getUserQuery = `SELECT user_id, role FROM users WHERE email = ?`;
            connection.promise().query(getUserQuery, [email])
                .then(([userResults]) => {
                    if (userResults.length === 0) {
                        return res.status(404).send('User not found');
                    }
    
                    const user = userResults[0];
    
                    // Kiểm tra xem người dùng đã tồn tại trong khóa học chưa
                    let checkCourseQuery = '';
                    let checkParams = [];
                    if (user.role === 'student') {
                        checkCourseQuery = `SELECT * FROM course_members WHERE course_id = ? AND student_id = ?`;
                        checkParams = [course_id, user.user_id];
                    } else if (user.role === 'teacher') {
                        checkCourseQuery = `SELECT * FROM course_teachers WHERE course_id = ? AND teacher_id = ?`;
                        checkParams = [course_id, user.user_id];
                    } else {
                        return res.status(400).send('Invalid user role');
                    }
    
                    // Kiểm tra xem người dùng đã có trong khóa học chưa
                    connection.promise().query(checkCourseQuery, checkParams)
                        .then(([checkResults]) => {
                            if (checkResults.length > 0) {
                                return res.status(400).send(`Member is already a member of the course`);
                            }
    
                            // Nếu chưa có, thêm người dùng vào bảng tương ứng
                            let addQuery = '';
                            if (user.role === 'student') {
                                addQuery = `INSERT INTO course_members (course_id, student_id) VALUES (?, ?)`;
                            } else if (user.role === 'teacher') {
                                addQuery = `INSERT INTO course_teachers (course_id, teacher_id) VALUES (?, ?)`;
                            }
    
                            connection.promise().query(addQuery, [course_id, user.user_id])
                                .then(() => {
                                    return res.status(200).send(`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} added to course`);
                                })
                                .catch(err => {
                                    console.error('Error adding member to course:', err);
                                    res.status(500).send('Failed to add member to course');
                                });
                        })
                        .catch(err => {
                            console.error('Error checking course membership:', err);
                            res.status(500).send('Failed to check if member exists in course');
                        });
                })
                .catch(err => {
                    console.error('Error adding member to course:', err);
                    res.status(500).send('Failed to add member to course');
                });
        } catch (err) {
            console.error('Error adding member to course:', err);
            res.status(500).send('Failed to add member to course');
        }
    }
    
    



};

export default courseManageController;