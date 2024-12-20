import connection from '../../database/dbConnect.js'; // Assuming you have a database connection module

export const deleteComment = (commentId) => {
    const content = "Message is unsent";  // Nội dung mới khi xóa comment

    const sql = `UPDATE comments SET content = ? WHERE comment_id = ?`;

    return new Promise((res, rej) => {
        connection.query(sql, [content, commentId], (err, result) => {
            if (err) {
                console.error("Error executing deleteComment", err);
                return rej(err);
            }

            // Không cần trả về dữ liệu gì, chỉ cần xác nhận update thành công
            res(result);  // Xử lý thành công mà không trả về gì
        });
    });
}