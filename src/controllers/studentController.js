import pool from '../config/db.js'

export const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        c.course_code,
        c.course_name
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      ORDER BY s.created_at DESC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch students',
    })
  }
}

export const getStudentById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `
      SELECT 
        s.*,
        c.course_code,
        c.course_name
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.id = $1
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Student not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch student',
    })
  }
}

export const getStudentByUserId = async (req, res) => {
  const { userId } = req.params

  try {
    const result = await pool.query(
      `
      SELECT 
        s.*,
        c.course_code,
        c.course_name
      FROM users u
      JOIN students s ON s.student_number = u.student_id
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE u.id = $1
      `,
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Student not found for this user',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch student by user id',
    })
  }
}

export const createStudent = async (req, res) => {
  const {
    avatar_url,
    first_name,
    middle_name,
    last_name,
    student_number,
    learner_reference_number,
    course_id,
    email_address,
    home_address,
    contact_number,
    birthday,
  } = req.body

  if (!first_name || !last_name || !student_number || !email_address) {
    return res.status(400).json({
      message: 'Missing required fields',
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO students (
        avatar_url,
        first_name,
        middle_name,
        last_name,
        student_number,
        learner_reference_number,
        course_id,
        email_address,
        home_address,
        contact_number,
        birthday
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        avatar_url,
        first_name,
        middle_name,
        last_name,
        student_number,
        learner_reference_number,
        course_id,
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
        message: 'Duplicate student_number or email',
      })
    }

    if (err.code === '23503') {
      return res.status(400).json({
        message: 'Invalid course_id',
      })
    }

    res.status(500).json({
      message: 'Failed to create student',
    })
  }
}

export const updateStudent = async (req, res) => {
  const { id } = req.params

  const {
    avatar_url,
    first_name,
    middle_name,
    last_name,
    student_number,
    learner_reference_number,
    course_id,
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
    !student_number &&
    !learner_reference_number &&
    !course_id &&
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
      UPDATE students
      SET avatar_url = COALESCE($1, avatar_url),
          first_name = COALESCE($2, first_name),
          middle_name = COALESCE($3, middle_name),
          last_name = COALESCE($4, last_name),
          student_number = COALESCE($5, student_number),
          learner_reference_number = COALESCE($6, learner_reference_number),
          course_id = COALESCE($7, course_id),
          email_address = COALESCE($8, email_address),
          home_address = COALESCE($9, home_address),
          contact_number = COALESCE($10, contact_number),
          birthday = COALESCE($11, birthday),
          updated_at = NOW()
      WHERE id = $12
      RETURNING *
      `,
      [
        avatar_url,
        first_name,
        middle_name,
        last_name,
        student_number,
        learner_reference_number,
        course_id,
        email_address,
        home_address,
        contact_number,
        birthday,
        id,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Student not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23505') {
      return res.status(400).json({
        message: 'Duplicate student_number or email',
      })
    }

    if (err.code === '23503') {
      return res.status(400).json({
        message: 'Invalid course_id',
      })
    }

    res.status(500).json({
      message: 'Failed to update student',
    })
  }
}

export const deleteStudent = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM students WHERE id = $1 RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Student not found',
      })
    }

    res.json({
      message: 'Student deleted successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to delete student',
    })
  }
}