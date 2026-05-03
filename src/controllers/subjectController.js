import pool from '../config/db.js'

export const getAllSubjects = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM subjects
      ORDER BY subject_name ASC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch subjects',
    })
  }
}

export const getSubjectById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(`SELECT * FROM subjects WHERE id = $1`, [
      id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Subject not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch subject',
    })
  }
}

export const createSubject = async (req, res) => {
  const { subject_code, subject_name, description, units, syllabus_url } =
    req.body

  if (!subject_code || !subject_name || !units) {
    return res.status(400).json({
      message: 'subject_code, subject_name, and units are required',
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO subjects (
        subject_code,
        subject_name,
        description,
        units,
        syllabus_url
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [subject_code, subject_name, description, units, syllabus_url],
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23505') {
      return res.status(400).json({
        message: 'Subject code already exists',
      })
    }

    if (err.code === '23514') {
      return res.status(400).json({
        message: 'Units must be greater than 0',
      })
    }

    res.status(500).json({
      message: 'Failed to create subject',
    })
  }
}

export const updateSubject = async (req, res) => {
  const { id } = req.params
  const { subject_code, subject_name, description, units, syllabus_url } =
    req.body

  if (
    !subject_code &&
    !subject_name &&
    !description &&
    !units &&
    !syllabus_url
  ) {
    return res.status(400).json({
      message: 'No fields to update',
    })
  }

  try {
    const result = await pool.query(
      `
      UPDATE subjects
      SET subject_code = COALESCE($1, subject_code),
          subject_name = COALESCE($2, subject_name),
          description = COALESCE($3, description),
          units = COALESCE($4, units),
          syllabus_url = COALESCE($5, syllabus_url),
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [subject_code, subject_name, description, units, syllabus_url, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Subject not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23505') {
      return res.status(400).json({
        message: 'Subject code already exists',
      })
    }

    if (err.code === '23514') {
      return res.status(400).json({
        message: 'Units must be greater than 0',
      })
    }

    res.status(500).json({
      message: 'Failed to update subject',
    })
  }
}

export const deleteSubject = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM subjects WHERE id = $1 RETURNING *`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Subject not found',
      })
    }

    res.json({
      message: 'Subject deleted successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to delete subject',
    })
  }
}
