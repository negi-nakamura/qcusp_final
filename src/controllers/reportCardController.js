import pool from '../config/db.js'

export const getAllReportCards = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        rc.id,
        rc.title,
        rc.school_year,
        rc.year_level,
        rc.semester,
        rc.total_units,
        rc.gwa,
        rc.total_remarks,
        rc.date_submitted,
        rc.card_url,
        rc.created_at,
        rc.updated_at,

        u.id AS user_id,
        s.id AS student_id,
        s.first_name AS student_first_name,
        s.last_name AS student_last_name,

        c.id AS course_id,
        c.course_code,
        c.course_name,

        cp.id AS campus_id,
        cp.campus_code,
        cp.campus_name

      FROM report_cards rc
      JOIN users u ON rc.user_id = u.id
      JOIN students s ON rc.student_id = s.id
      JOIN courses c ON rc.course_id = c.id
      JOIN campuses cp ON rc.campus_id = cp.id

      ORDER BY rc.created_at DESC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch report cards',
    })
  }
}

export const getReportCardById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `
      SELECT * FROM report_cards WHERE id = $1
      `,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Report card not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch report card',
    })
  }
}

export const getReportCardsByStudentId = async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        rc.id,
        rc.title,
        rc.school_year,
        rc.year_level,
        rc.semester,
        rc.total_units,
        rc.gwa,
        rc.total_remarks,
        rc.date_submitted,
        rc.card_url,

        c.course_code,
        c.course_name,

        cp.campus_name

      FROM report_cards rc
      JOIN users u ON rc.user_id = u.id
      JOIN students s ON rc.student_id = s.id
      JOIN courses c ON rc.course_id = c.id
      JOIN campuses cp ON rc.campus_id = cp.id

      WHERE rc.student_id = $1

      ORDER BY rc.created_at DESC
      `,
      [student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No report cards found for this student",
      });
    }

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch report cards",
    });
  }
};

export const createReportCard = async (req, res) => {
  const {
    user_id,
    student_id,
    course_id,
    campus_id,
    title,
    school_year,
    year_level,
    semester,
    total_units,
    gwa,
    total_remarks,
    date_submitted,
    card_url,
  } = req.body

  if (
    !user_id ||
    !student_id ||
    !course_id ||
    !campus_id ||
    !title ||
    !school_year ||
    !year_level ||
    !semester
  ) {
    return res.status(400).json({
      message: 'Missing required fields',
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO report_cards (
        user_id,
        student_id,
        course_id,
        campus_id,
        title,
        school_year,
        year_level,
        semester,
        total_units,
        gwa,
        total_remarks,
        date_submitted,
        card_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
      `,
      [
        user_id,
        student_id,
        course_id,
        campus_id,
        title,
        school_year,
        year_level,
        semester,
        total_units,
        gwa,
        total_remarks,
        date_submitted,
        card_url,
      ],
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)

    if (err.code === '23503') {
      return res.status(400).json({
        message: 'Invalid foreign key reference',
      })
    }

    res.status(500).json({
      message: 'Failed to create report card',
    })
  }
}

export const updateReportCard = async (req, res) => {
  const { id } = req.params

  const {
    user_id,
    student_id,
    course_id,
    campus_id,
    title,
    school_year,
    year_level,
    semester,
    total_units,
    gwa,
    total_remarks,
    date_submitted,
    card_url,
  } = req.body

  if (
    !user_id &&
    !student_id &&
    !course_id &&
    !campus_id &&
    !title &&
    !school_year &&
    !year_level &&
    !semester &&
    !total_units &&
    !gwa &&
    !total_remarks &&
    !date_submitted &&
    !card_url
  ) {
    return res.status(400).json({
      message: 'No fields to update',
    })
  }

  try {
    const result = await pool.query(
      `
      UPDATE report_cards
      SET user_id = COALESCE($1, user_id),
          student_id = COALESCE($2, student_id),
          course_id = COALESCE($3, course_id),
          campus_id = COALESCE($4, campus_id),
          title = COALESCE($5, title),
          school_year = COALESCE($6, school_year),
          year_level = COALESCE($7, year_level),
          semester = COALESCE($8, semester),
          total_units = COALESCE($9, total_units),
          gwa = COALESCE($10, gwa),
          total_remarks = COALESCE($11, total_remarks),
          date_submitted = COALESCE($12, date_submitted),
          card_url = COALESCE($13, card_url),
          updated_at = NOW()
      WHERE id = $14
      RETURNING *
      `,
      [
        user_id,
        student_id,
        course_id,
        campus_id,
        title,
        school_year,
        year_level,
        semester,
        total_units,
        gwa,
        total_remarks,
        date_submitted,
        card_url,
        id,
      ],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Report card not found',
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
      message: 'Failed to update report card',
    })
  }
}

export const deleteReportCard = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM report_cards WHERE id = $1 RETURNING *`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Report card not found',
      })
    }

    res.json({
      message: 'Report card deleted successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to delete report card',
    })
  }
}
