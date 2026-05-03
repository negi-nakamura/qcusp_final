import pool from '../config/db.js'

export const getAllSessions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.user_id,
        s.ip_address,
        s.user_agent,
        s.country,
        s.region,
        s.city,
        s.is_active,
        s.login_at,
        s.last_access,
        s.logout_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.login_at DESC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch sessions',
    })
  }
}

export const getSessionById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `
      SELECT * FROM sessions WHERE id = $1
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Session not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch session',
    })
  }
}

export const getSessionsByUser = async (req, res) => {
  const { userId } = req.params

  try {
    const result = await pool.query(
      `
      SELECT * FROM sessions
      WHERE user_id = $1
      `,
      [userId]
    )

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch user sessions',
    })
  }
}

export const logoutSession = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `
      UPDATE sessions
      SET logout_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Session not found',
      })
    }

    res.json({
      message: 'Logged out successfully',
      session: result.rows[0],
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to logout session',
    })
  }
}

export const deactivateSession = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `
      UPDATE sessions
      SET is_active = FALSE,
          logout_at = COALESCE(logout_at, NOW())
      WHERE id = $1
      RETURNING *
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Session not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to deactivate session',
    })
  }
}