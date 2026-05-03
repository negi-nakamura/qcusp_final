import pool from '../config/db.js'

export const getAllSubjectOfferings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        so.id,
        so.day_of_week,
        so.room,
        so.start_time,
        so.end_time,
        so.section,
        so.is_active,

        sc.id AS subject_course_id,
        c.course_code,
        c.course_name,
        s.subject_code,
        s.subject_name,
        s.units,

        cp.id AS campus_id,
        cp.campus_code,
        cp.campus_name,

        p.id AS professor_id,
        p.first_name,
        p.middle_name,
        p.last_name

      FROM subject_offerings so
      JOIN subject_courses sc ON so.subject_course_id = sc.id
      JOIN courses c ON sc.course_id = c.id
      JOIN subjects s ON sc.subject_id = s.id
      JOIN campuses cp ON so.campus_id = cp.id
      LEFT JOIN professors p ON so.professor_id = p.id
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch subject offerings',
    })
  }
}

export const getSubjectOfferingById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `
      SELECT * FROM subject_offerings
      WHERE id = $1
      `,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Subject offering not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch subject offering',
    })
  }
}

export const getSubjectOfferingsByStudentId = async (req, res) => {
  const { studentId } = req.params

  try {
    const result = await pool.query(
      `
      SELECT 
        so.id,
        so.day_of_week,
        so.room,
        so.start_time,
        so.end_time,
        so.section,
        so.is_active,

        sso.status,
        sso.enrolled_at,

        sc.id AS subject_course_id,
        c.course_code,
        c.course_name,
        s.subject_code,
        s.subject_name,
        s.description,
        s.units,
        s.syllabus_url,

        cp.id AS campus_id,
        cp.campus_code,
        cp.campus_name,

        p.id AS professor_id,
        p.first_name,
        p.middle_name,
        p.last_name

      FROM student_subject_offerings sso
      JOIN subject_offerings so ON sso.subject_offering_id = so.id
      JOIN subject_courses sc ON so.subject_course_id = sc.id
      JOIN courses c ON sc.course_id = c.id
      JOIN subjects s ON sc.subject_id = s.id
      JOIN campuses cp ON so.campus_id = cp.id
      LEFT JOIN professors p ON so.professor_id = p.id

      WHERE sso.student_id = $1
        AND sso.status = 'enrolled'
      `,
      [studentId]
    )

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Failed to fetch student subject offerings",
    })
  }
}

export const createSubjectOffering = async (req, res) => {
  const {
    subject_course_id,
    campus_id,
    professor_id,
    day_of_week,
    room,
    start_time,
    end_time,
    section,
  } = req.body

  if (!subject_course_id || !campus_id || !room || !start_time || !end_time) {
    return res.status(400).json({
      message: 'Missing required fields',
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO subject_offerings (
        subject_course_id,
        campus_id,
        professor_id,
        day_of_week,
        room,
        start_time,
        end_time,
        section
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        subject_course_id,
        campus_id,
        professor_id,
        day_of_week,
        room,
        start_time,
        end_time,
        section,
      ],
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)

    // FK error
    if (err.code === '23503') {
      return res.status(400).json({
        message: 'Invalid foreign key reference',
      })
    }

    res.status(500).json({
      message: 'Failed to create offering',
    })
  }
}

export const updateSubjectOffering = async (req, res) => {
  const { id } = req.params

  const {
    subject_course_id,
    campus_id,
    professor_id,
    day_of_week,
    room,
    start_time,
    end_time,
    section,
    is_active,
  } = req.body

  if (
    !subject_course_id &&
    !campus_id &&
    !professor_id &&
    !day_of_week &&
    !room &&
    !start_time &&
    !end_time &&
    !section &&
    is_active === undefined
  ) {
    return res.status(400).json({
      message: 'No fields to update',
    })
  }

  try {
    const result = await pool.query(
      `
      UPDATE subject_offerings
      SET subject_course_id = COALESCE($1, subject_course_id),
          campus_id = COALESCE($2, campus_id),
          professor_id = COALESCE($3, professor_id),
          day_of_week = COALESCE($4, day_of_week),
          room = COALESCE($5, room),
          start_time = COALESCE($6, start_time),
          end_time = COALESCE($7, end_time),
          section = COALESCE($8, section),
          is_active = COALESCE($9, is_active)
      WHERE id = $10
      RETURNING *
      `,
      [
        subject_course_id,
        campus_id,
        professor_id,
        day_of_week,
        room,
        start_time,
        end_time,
        section,
        is_active,
        id,
      ],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Subject offering not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23503') {
      return res.status(400).json({
        message: 'Invalid foreign key reference',
      })
    }

    res.status(500).json({
      message: 'Failed to update offering',
    })
  }
}

export const deleteSubjectOffering = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM subject_offerings WHERE id = $1 RETURNING *`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Subject offering not found',
      })
    }

    res.json({
      message: 'Subject offering deleted successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to delete offering',
    })
  }
}
