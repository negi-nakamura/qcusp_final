import pool from '../config/db.js'

export const getAllSubjectCourses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sc.id,
        sc.year_level,
        sc.semester,
        sc.is_active,
        c.id AS course_id,
        c.course_code,
        c.course_name,
        s.id AS subject_id,
        s.subject_code,
        s.subject_name,
        s.units
      FROM subject_courses sc
      JOIN courses c ON sc.course_id = c.id
      JOIN subjects s ON sc.subject_id = s.id
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch subject courses',
    })
  }
}

export const getSubjectCourseById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `
      SELECT 
        sc.*,
        c.course_code,
        c.course_name,
        s.subject_code,
        s.subject_name,
        s.units
      FROM subject_courses sc
      JOIN courses c ON sc.course_id = c.id
      JOIN subjects s ON sc.subject_id = s.id
      WHERE sc.id = $1
      `,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Record not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch record',
    })
  }
}

export const createSubjectCourse = async (req, res) => {
  const { course_id, subject_id, year_level, semester } = req.body

  if (!course_id || !subject_id) {
    return res.status(400).json({
      message: 'course_id and subject_id are required',
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO subject_courses (course_id, subject_id, year_level, semester)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [course_id, subject_id, year_level, semester],
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23505') {
      return res.status(400).json({
        message: 'This subject is already assigned to this course',
      })
    }

    res.status(500).json({
      message: 'Failed to create mapping',
    })
  }
}

export const updateSubjectCourse = async (req, res) => {
  const { id } = req.params
  const { course_id, subject_id, year_level, semester, is_active } = req.body

  if (
    !course_id &&
    !subject_id &&
    !year_level &&
    !semester &&
    is_active === undefined
  ) {
    return res.status(400).json({
      message: 'No fields to update',
    })
  }

  try {
    const result = await pool.query(
      `
      UPDATE subject_courses
      SET course_id = COALESCE($1, course_id),
          subject_id = COALESCE($2, subject_id),
          year_level = COALESCE($3, year_level),
          semester = COALESCE($4, semester),
          is_active = COALESCE($5, is_active)
      WHERE id = $6
      RETURNING *
      `,
      [course_id, subject_id, year_level, semester, is_active, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Record not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23505') {
      return res.status(400).json({
        message: 'Duplicate course-subject pair',
      })
    }

    res.status(500).json({
      message: 'Failed to update mapping',
    })
  }
}

export const deleteSubjectCourse = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM subject_courses WHERE id = $1 RETURNING *`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Record not found',
      })
    }

    res.json({
      message: 'Mapping deleted successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to delete mapping',
    })
  }
}
