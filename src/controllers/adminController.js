import pool from '../config/db.js'

/* 📌 Get all admins */
export const getAllAdmins = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM admin
      ORDER BY created_at DESC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch admins',
    })
  }
}

/* 📌 Get admin by ID */
export const getAdminById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `SELECT * FROM admin WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Admin not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch admin',
    })
  }
}

/* 📌 Get admin by USER ID (IMPORTANT for auth) */
export const getAdminByUserId = async (req, res) => {
  const { userId } = req.params

  try {
    const result = await pool.query(
      `
      SELECT a.*
      FROM users u
      JOIN admin a ON a.id = u.admin_id
      WHERE u.id = $1
      `,
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Admin not found for this user',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch admin by user id',
    })
  }
}

/* 📌 Create admin */
export const createAdmin = async (req, res) => {
  const {
    avatar_url,
    first_name,
    middle_name,
    last_name,
    email_address,
    home_address,
    contact_number,
    birthday,
  } = req.body

  if (!first_name || !last_name || !email_address) {
    return res.status(400).json({
      message: 'Missing required fields',
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO admin (
        avatar_url,
        first_name,
        middle_name,
        last_name,
        email_address,
        home_address,
        contact_number,
        birthday
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        avatar_url,
        first_name,
        middle_name,
        last_name,
        email_address,
        home_address,
        contact_number,
        birthday,
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23505') {
      return res.status(400).json({
        message: 'Duplicate email address',
      })
    }

    res.status(500).json({
      message: 'Failed to create admin',
    })
  }
}

/* 📌 Update admin */
export const updateAdmin = async (req, res) => {
  const { id } = req.params

  const {
    avatar_url,
    first_name,
    middle_name,
    last_name,
    email_address,
    home_address,
    contact_number,
    birthday,
  } = req.body

  if (
    !avatar_url &&
    !first_name &&
    !middle_name &&
    !last_name &&
    !email_address &&
    !home_address &&
    !contact_number &&
    !birthday
  ) {
    return res.status(400).json({
      message: 'No fields to update',
    })
  }

  try {
    const result = await pool.query(
      `
      UPDATE admin
      SET avatar_url = COALESCE($1, avatar_url),
          first_name = COALESCE($2, first_name),
          middle_name = COALESCE($3, middle_name),
          last_name = COALESCE($4, last_name),
          email_address = COALESCE($5, email_address),
          home_address = COALESCE($6, home_address),
          contact_number = COALESCE($7, contact_number),
          birthday = COALESCE($8, birthday),
          updated_at = NOW()
      WHERE id = $9
      RETURNING *
      `,
      [
        avatar_url,
        first_name,
        middle_name,
        last_name,
        email_address,
        home_address,
        contact_number,
        birthday,
        id,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Admin not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23505') {
      return res.status(400).json({
        message: 'Duplicate email address',
      })
    }

    res.status(500).json({
      message: 'Failed to update admin',
    })
  }
}

/* 📌 Delete admin */
export const deleteAdmin = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM admin WHERE id = $1 RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Admin not found',
      })
    }

    res.json({
      message: 'Admin deleted successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to delete admin',
    })
  }
}