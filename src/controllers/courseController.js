import pool from '../config/db.js'

export const getAllCourses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM courses
      ORDER BY course_name ASC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch courses',
    })
  }
}

export const getCourseById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(`SELECT * FROM courses WHERE id = $1`, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Course not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch course',
    })
  }
}

export const createCourse = async (req, res) => {
  const { course_code, course_name } = req.body

  if (!course_code || !course_name) {
    return res.status(400).json({
      message: 'All fields are required',
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO courses (course_code, course_name)
      VALUES ($1, $2)
      RETURNING *
      `,
      [course_code, course_name],
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23505') {
      return res.status(400).json({
        message: 'Course code already exists',
      })
    }

    res.status(500).json({
      message: 'Failed to create course',
    })
  }
}

export const updateCourse = async (req, res) => {
  const { id } = req.params
  const { course_code, course_name } = req.body

  if (!course_code && !course_name) {
    return res.status(400).json({
      message: 'No fields to update',
    })
  }

  try {
    const result = await pool.query(
      `
      UPDATE courses
      SET course_code = COALESCE($1, course_code),
          course_name = COALESCE($2, course_name)
      WHERE id = $3
      RETURNING *
      `,
      [course_code, course_name, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Course not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23505') {
      return res.status(400).json({
        message: 'Course code already exists',
      })
    }

    res.status(500).json({
      message: 'Failed to update course',
    })
  }
}

export const deleteCourse = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM courses WHERE id = $1 RETURNING *`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Course not found',
      })
    }

    res.json({
      message: 'Course deleted successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to delete course',
    })
  }
}
