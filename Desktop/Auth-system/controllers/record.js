const pool = require("../models/db");

async function addRecord(req, res) {
    try {
        const { description, amount, type, date } = req.body;

        // Basic validation
        if (!description || !amount || !type || !date) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // req.user comes from your auth middleware (JWT cookie)
        const userId = req.user.id;

        const result = await pool.query(
            `INSERT INTO records (user_id, description, amount, type, date)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userId, description, amount, type, date]
        );

        res.status(201).json({
            msg: "Record added successfully",
            record: result.rows[0]
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

async function getRecords(req, res) {
    try {
        // Only fetch records belonging to the logged-in user
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        const query = isAdmin
            ? `SELECT records.*, users.name as owner_name
               FROM records
               JOIN users ON records.user_id = users.id
               ORDER BY records.date DESC`
            : `SELECT * FROM records WHERE user_id = $1 ORDER BY date DESC`;

        const values = isAdmin ? [] : [userId];

        const result = await pool.query(query, values);


        res.status(200).json({
            records: result.rows
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}




async function deleteRecords(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        // Admin can delete anyone's record, user can only delete their own
        const query = isAdmin
            ? `DELETE FROM records WHERE id = $1 RETURNING *`
            : `DELETE FROM records WHERE id = $1 AND user_id = $2 RETURNING *`;

        const values = isAdmin ? [id] : [id, userId];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Record not found or not authorized" });
        }

        res.status(200).json({ msg: "Record deleted", record: result.rows[0] });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

async function updateRecords(req, res) {
    try {
        const { id } = req.params;
        const { description, amount, type, date } = req.body;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!description || !amount || !type || !date) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // Admin can update anyone's record, user can only update their own
        const query = isAdmin
            ? `UPDATE records SET description=$1, amount=$2, type=$3, date=$4
               WHERE id=$5 RETURNING *`
            : `UPDATE records SET description=$1, amount=$2, type=$3, date=$4
               WHERE id=$5 AND user_id=$6 RETURNING *`;

        const values = isAdmin
            ? [description, amount, type, date, id]
            : [description, amount, type, date, id, userId];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Record not found or not authorized" });
        }

        res.status(200).json({ msg: "Record updated", record: result.rows[0] });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

module.exports = {
    addRecord,
    getRecords,
    deleteRecords,
    updateRecords
};

