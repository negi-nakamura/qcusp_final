import pool from '../config/db.js'

export const getAllProfessors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM professors
      ORDER BY last_name ASC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch professors',
    })
  }
}

export const getProfessorById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(`SELECT * FROM professors WHERE id = $1`, [
      id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Professor not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch professor',
    })
  }
}

export const createProfessor = async (req, res) => {
  const { first_name, middle_name, last_name } = req.body

  if (!first_name || !last_name) {
    return res.status(400).json({
      message: 'first_name and last_name are required',
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO professors (first_name, middle_name, last_name)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [first_name, middle_name || null, last_name],
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to create professor',
    })
  }
}

export const updateProfessor = async (req, res) => {
  const { id } = req.params
  const { first_name, middle_name, last_name, is_active } = req.body

  if (!first_name && !middle_name && !last_name && is_active === undefined) {
    return res.status(400).json({
      message: 'No fields to update',
    })
  }

  try {
    const result = await pool.query(
      `
      UPDATE professors
      SET first_name = COALESCE($1, first_name),
          middle_name = COALESCE($2, middle_name),
          last_name = COALESCE($3, last_name),
          is_active = COALESCE($4, is_active)
      WHERE id = $5
      RETURNING *
      `,
      [first_name, middle_name, last_name, is_active, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Professor not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to update professor',
    })
  }
}

export const deleteProfessor = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM professors WHERE id = $1 RETURNING *`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Professor not found',
      })
    }

    res.json({
      message: 'Professor deleted successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to delete professor',
    })
  }
}
