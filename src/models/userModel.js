import pool from '../config/db.js'

export const User = {
  async create({ student_id, admin_id, password }) {
    const result = await pool.query(
      `INSERT INTO users (student_id, admin_id, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, student_id, admin_id, role, created_at`,
      [student_id || null, admin_id || null, password],
    )
    return result.rows[0]
  },

  async findByIdentifier({ student_id, admin_id }) {
    const result = await pool.query(
      `SELECT * FROM users
       WHERE (student_id = $1 AND role = 'student')
          OR (admin_id = $2 AND role = 'admin')`,
      [student_id, admin_id],
    )
    return result.rows[0] || null
  },

  async findById(id) {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id])
    return result.rows[0] || null
  },

  async updatePassword(id, hashedPassword) {
    const result = await pool.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, student_id, admin_id, role`,
      [hashedPassword, id],
    )
    return result.rows[0]
  },

  async findAll() {
    const result = await pool.query(
      `SELECT id, student_id, admin_id, role, created_at FROM users`,
    )
    return result.rows
  },
}
