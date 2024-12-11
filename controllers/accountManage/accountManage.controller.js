import connection from "../../database/dbConnect.js";
import bcrypt from 'bcrypt';

const accountManageController = {
    getAllTeachersAccount: (req, res) => {
        const sql = `SELECT user_id, email, full_name, phone_number,
        birth_date, gender FROM users
                    WHERE role = 'teacher'
                    ORDER BY user_id ;`
        connection.query(sql, (err, data)=>{
            if(err){
                console.error("Error query at getAllTeacherInfo:", err);
                return res.status(500).send("Error executing query all teacher info");
            }
            return res.status(200).json(data);
        })
    },

    getAllStudentsAccount: (req, res) => {
        const sql = `SELECT user_id, email, full_name, phone_number,
        birth_date, gender FROM users
                    WHERE role = 'student'
                    ORDER BY user_id;`
        connection.query(sql, (err, data)=>{
            if(err){
                console.error("Error query at getAllStudentInfo:", err);
                return res.status(500).send("Error executing query all student info");
            }
            return res.status(200).json(data);
        })
    },

    deleteAccount: (req, res) => {
        const { userId } = req.params;
        const sql = `DELETE FROM users WHERE user_id = ?`;

        connection.query(sql, [userId], (err, result) => {
            if (err) {
                console.error("Error query at deleteAccount:", err);
                return res.status(500).send("Error deleting account");
            }
            return res.status(200).send("Account deleted successfully");
        });
    },


    getAccountById: (req, res) => {
        const { userId } = req.params; // Lấy userId từ tham số URL
        const sql = `SELECT user_id, email, full_name, phone_number, 
                    birth_date, gender, role FROM users WHERE user_id = ?`;
    
        connection.query(sql, [userId], (err, data) => {
            if (err) {
                console.error("Error query at getAccountById:", err);
                return res.status(500).send("Error executing query to get user by ID");
            }
            if (data.length === 0) {
                return res.status(404).send("User not found");
            }
            return res.status(200).json(data[0]); 
        });
    },


    

    updateAccountById: (req, res) => {
        const { userId } = req.params; 
        const { email, full_name, phone_number, birth_date, gender, role } = req.body; // Lấy dữ liệu từ request body
    
        const sql = `
            UPDATE users 
            SET email = ?, 
                full_name = ?, 
                phone_number = ?, 
                birth_date = ?, 
                gender = ?, 
                role = ? 
            WHERE user_id = ?`;
    
        connection.query(
            sql,
            [email, full_name, phone_number, birth_date, gender, role, userId],
            (err, result) => {
                if (err) {
                    console.error("Error query at updateAccountById:", err);
                    return res.status(500).send("Error updating user account");
                }
                if (result.affectedRows === 0) {
                    return res.status(404).send("User not found");
                }
                return res.status(200).send("User account updated successfully");
            }
        );
    },

    createAccount: async (req, res) => {
        const { email, full_name, phone_number, birth_date, gender, role, password, user_id } = req.body;
    
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
    
            const sql = `
                INSERT INTO users (email, full_name, phone_number, birth_date, gender, role, password, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
            connection.query(
                sql,
                [email, full_name, phone_number, birth_date, gender, role, hashedPassword, user_id],
                (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            if (err.sqlMessage.includes('users.email')) {
                                return res.status(400).send("User id hoặc email đã tồn tại");
                            } else if (err.sqlMessage.includes('users.user_id')) {
                                return res.status(400).send("User id hoặc email đã tồn tại");
                            } else if (err.sqlMessage.includes("users.PRIMARY")) {
                                return res.status(400).send("User id hoặc email đã tồn tại");
                            }
                        } else {
    
                        console.error("Error query at createAccount:", err);
                        return res.status(500).send("Lỗi khi tạo tài khoản");}
                    }
                    return res.status(201).send("Tài khoản mới được tạo thành công");
                }
            );
        } catch (err) {
            console.error("Error hashing password:", err);
            return res.status(500).send("Lỗi xử lý mật khẩu");
        }
    },
    
   
    
}
export default accountManageController;