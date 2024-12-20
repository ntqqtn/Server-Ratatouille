import connection from "../../database/dbConnect.js";

const submissionManageController = {
  createSubmission: async (req, res) => {
    const { assignment_id, student_id } = req.params;
    const sql = `INSERT INTO submissions (assignment_id, student_id) VALUES (?, ?);`;
    connection.query(sql, [assignment_id, student_id], (err, data) => {
      if (err) {
        console.error("Error query at createSubmission:", err);
        return res.status(500).send("Error creating submission");
      } else {
        return res.status(200).json({ submission_id: data.insertId });
      }
    });
  },

  createSubmissionFile: async (req, res) => {
    const { submission_id } = req.params;
    const submissionFile = req.body;

    const sql = `INSERT INTO submission_files (submission_id, file_name, file_path) VALUES ?`;
    try {
      if (submissionFile.length > 0) {
        const submissionValues = submissionFile.map((file) => [
          submission_id,
          file.fileName,
          file.key,
        ]);

        await connection.promise().query(sql, [submissionValues]);
      }
      return res.status(200).send("Create notiFile successfully");
    } catch (err) {
      console.error("Error in createNewNoti:", err);
      return res.status(500).send("Error executing creating noti, file");
    }
  },

  getSubmission: async (req, res) => {
    const { assignment_id, student_id } = req.params;
    const sql = `SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?;`;
    connection.query(sql, [assignment_id, student_id], (err, data) => {
      if (err) {
        console.error("Error query at getSubmission:", err);
        return res.status(500).send("Error getting submission");
      } else {
        return res.status(200).json(data[0]);
      }
    });
  },

  getSubmissionFileNameAndPath: (req, res) => {
    const { submission_id } = req.params;
    const sql =
      "SELECT file_name, file_path FROM submission_files WHERE submission_id = ?";

    connection.query(sql, [submission_id], (err, data) => {
      if (err) {
        console.error("Error query at getSubmissionFile:", err);
        return res
          .status(500)
          .send("Error executing query all Submission file");
      }

      if (!data || data.length === 0) {
        return res.status(200).json({ data: [] });
      }
      return res.status(200).json(data);
    });
  },

  deleteSubmission: (req, res) => {
    const { submission_id } = req.params;
    const sql = `DELETE FROM submissions WHERE submission_id = ?`;
    connection.query(sql, [submission_id], (err, data) => {
      if (err) {
        console.error("Error query at deletesubmission:", err);
        return res.status(500).send("Error executing query delete submission");
      }
      return res.status(200).send("Delete submission successfully");
    });
  },

  deleteSubmissionFile: (req, res) => {
    const { submission_id } = req.params;
    const sql = `DELETE FROM submission_files WHERE submission_id = ?`;
    connection.query(sql, [submission_id], (err, data) => {
      if (err) {
        console.error("Error query at deletesubmissionFile:", err);
        return res
          .status(500)
          .send("Error executing query delete submission file");
      }
      return res.status(200).send("Delete submission file successfully");
    });
  },

  getSubmissionInAnAssignment: async (req, res) => {
    const { assignment_id } = req.params;

    try {
      // Lấy danh sách học sinh trong khóa học
      const [students] = await connection.promise().query(
        `
        SELECT u.user_id, u.full_name
        FROM users u
        JOIN course_members cm ON u.user_id = cm.student_id
        JOIN assignments a ON cm.course_id = a.course_id
        WHERE a.assignment_id = ?
    `,
        [assignment_id]
      );

      // Lấy danh sách học sinh đã nộp bài
      const [submissions] = await connection.promise().query(
        `
        SELECT s.student_id, u.full_name, s.submission_date, s.submission_id, s.grade
        FROM submissions s
        JOIN users u ON s.student_id = u.user_id
        WHERE s.assignment_id = ?
    `,
        [assignment_id]
      );

      // Tạo bảng kết hợp thông tin học sinh và thông tin nộp bài
      const result = students.map((student) => {
        const submission = submissions.find(
          (sub) => sub.student_id === student.user_id
        );
        return {
          studentID: student.user_id,
          fullname: student.full_name,
          submission_date: submission ? submission.submission_date : "late",
          submission_id: submission ? submission.submission_id : null,
          grade: submission ? submission.grade : 0,
        };
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  gradingSubmission: async (req, res) => {
    const { submission_id } = req.params;
    const { grade } = req.body;
    const sql = `UPDATE submissions SET grade = ? WHERE submission_id = ?`;
    connection.query(sql, [grade, submission_id], (err, data) => {
      if (err) {
        console.error("Error query at gradingSubmission:", err);
        return res.status(500).send("Error grading submission");
        } else {
        return res.status(200).send("Grading submission successfully");
        } 
    })
  },

  getSubmissionBySubmissionId: async (req, res) => {
    const { submission_id } = req.params;
    const sql = `SELECT * FROM submissions WHERE submission_id = ?`;
    connection.query(sql, [submission_id], (err, data) => {
      if (err) {
        console.error("Error query at getSubmissionBySubmissionId:", err);
        return res.status(500).send("Error getting submission by submission id");
      } else {
        return res.status(200).json(data[0]);
      }
    })
  }
}


export default submissionManageController;
