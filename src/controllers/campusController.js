import pool from '../config/db.js'

export const getAllCampuses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM campuses
      ORDER BY campus_name ASC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch campuses',
    })
  }
}

export const getCampusById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(`SELECT * FROM campuses WHERE id = $1`, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Campus not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch campus',
    })
  }
}

export const createCampus = async (req, res) => {
  const { campus_code, campus_name, address } = req.body

  if (!campus_code || !campus_name || !address) {
    return res.status(400).json({
      message: 'All fields are required',
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO campuses (campus_code, campus_name, address)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [campus_code, campus_name, address],
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23505') {
      return res.status(400).json({
        message: 'Campus code already exists',
      })
    }

    res.status(500).json({
      message: 'Failed to create campus',
    })
  }
}

export const updateCampus = async (req, res) => {
  const { id } = req.params
  const { campus_code, campus_name, address } = req.body

  if (!campus_code && !campus_name && !address) {
    return res.status(400).json({
      message: 'No fields to update',
    })
  }

  try {
    const result = await pool.query(
      `
      UPDATE campuses
      SET campus_code = COALESCE($1, campus_code),
          campus_name = COALESCE($2, campus_name),
          address = COALESCE($3, address)
      WHERE id = $4
      RETURNING *
      `,
      [campus_code, campus_name, address, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Campus not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23505') {
      return res.status(400).json({
        message: 'Campus code already exists',
      })
    }

    res.status(500).json({
      message: 'Failed to update campus',
    })
  }
}

export const deleteCampus = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM campuses WHERE id = $1 RETURNING *`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Campus not found',
      })
    }

    res.json({
      message: 'Campus deleted successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to delete campus',
    })
  }
}
