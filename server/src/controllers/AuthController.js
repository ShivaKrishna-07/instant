import pool from '../db/index.js';


export const checkUser = async (req, res) => {
    const { email } = req.body;
    
    try {
        const result = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        res.json({ exists: result.rowCount > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}