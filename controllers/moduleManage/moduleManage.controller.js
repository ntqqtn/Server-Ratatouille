import connection from "../../database/dbConnect.js";

const moduleManageController = {
    getModulesByCourse: (req, res) => {
        const { course_id } = req.params;
        if (!course_id) {
            return res.status(400).send('Missing required field: course_id');
        }
        const query = `SELECT * FROM modules WHERE course_id = ?`;
        connection.query(query, [course_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database query error' });
            }
            if (result.length === 0) {
                return res.status(200).json([]);
            }
            return res.status(200).json(result); // Send the results as JSON
        });
    },

    addModule: (req, res) => {
        const { course_id, module_name, description} = req.body;
        if (!course_id || !module_name || !description) {
            return res.status(400).send('Missing required fields: course_id, module_name, description');
        }
        const query = `INSERT INTO modules (course_id, module_name, description) VALUES (?, ?, ?)`;
        connection.query(query, [course_id, module_name, description], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database query error' });
            }
            const newModule = {
                module_id: result.insertId,
                course_id,
                module_name,
                description,
            }
            return res.status(201).json({ message: 'Module added successfully', newModule });
        });
    },

    deleteModule: (req, res) => {
        const { module_id } = req.params;
        if (!module_id) {
            return res.status(400).send('Missing required field: module_id');
        }
        const deleteMaterialsQuery = `DELETE FROM materials WHERE module_id = ?`;

        connection.query(deleteMaterialsQuery, [module_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database query error' });
            }

            const deleteModuleQuery = `DELETE FROM modules WHERE module_id = ?`;

            connection.query(deleteModuleQuery, [module_id], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Database query error' });
                }
                // if (result.affectedRows === 0) {
                //     return res.status(404).json({ message: 'Module not found' });
                // }
                return res.status(200).json({ message: 'Module deleted successfully' });
            });
        });
    },
    
    editModule: (req, res) => {
        const { module_id } = req.params;
        const { module_name, description } = req.body;
        if (!module_name || !description) {
            return res.status(400).send('Missing required fields: module_id, module_name, description');
        }
        const query = `UPDATE modules SET module_name = ?, description = ? WHERE module_id = ?`;
        connection.query(query, [module_name, description, module_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database query error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Module not found' });
            }
            return res.status(200).json({ message: 'Module updated successfully' });
        });
    },
};

export default moduleManageController