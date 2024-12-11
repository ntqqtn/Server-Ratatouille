import connection from '../../database/dbConnect.js'; // Assuming you have a database connection module

export const createComment = (data) => {
    const { post_id, creator_id, content, reply_to_comment } = data;

    const sql = `INSERT INTO comments (post_id, creator_id, content, reply_to_comment) VALUES (?, ?, ?, ?)`;
    const sql2 = `SELECT 
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
                WHERE c1.comment_id = ?;`

    return new Promise((res, rej) => {
        connection.query(sql, [post_id, creator_id, content, reply_to_comment], (err, result) => {
            if(err) {
                console.error("Error executing createComment", err);
                return rej(err);
            }

            connection.query(sql2, [result.insertId], (err, rows) => {
                if(err) {
                    console.error("Error executing createComment", err);
                    return rej(err);
                }
                res({
                    comment_id: result.insertId,
                    post_id: rows[0].post_id,
                    creator_id: rows[0].creator_id, 
                    creator_full_name: rows[0].creator_full_name,
                    content: rows[0].content,
                    reply_to_comment_id: rows[0].reply_to_comment_id,
                    created_date: rows[0].created_date,
                    last_modified: rows[0].last_modified,
                    replied_comment_id: rows[0].replied_comment_id,
                    replied_creator_id: rows[0].replied_creator_id,
                    replied_creator_full_name: rows[0].replied_creator_full_name,
                    replied_content: rows[0].replied_content,
                    replied_created_date: rows[0].replied_created_date,
                    replied_last_modified: rows[0].replied_last_modified
                })
            })
        })
    }) 
}