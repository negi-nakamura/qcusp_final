import pool from "../config/db.js";

export async function healthCheck(req, res) {
  try {
    const result = await pool.query("SELECT 1");
    res.json({ status: "ok", db: result.rowCount === 1 ? "reachable" : "unreachable" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}