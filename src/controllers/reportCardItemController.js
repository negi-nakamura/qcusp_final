import pool from '../config/db.js'

export const getAllReportCardItems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        rci.id,
        rci.grade,
        rci.remarks,
        rci.created_at,
        rci.updated_at,

        rc.id AS report_card_id,
        rc.title,

        s.id AS subject_id,
        s.subject_code,
        s.subject_name,
        s.units,

        p.id AS professor_id,
        p.first_name,
        p.last_name

      FROM report_card_items rci
      JOIN report_cards rc ON rci.report_card_id = rc.id
      JOIN subjects s ON rci.subject_id = s.id
      LEFT JOIN professors p ON rci.professor_id = p.id
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch report card items',
    })
  }
}

export const getReportCardItemById = async (req, res) => {
  const { id, report_id } = req.params

  try {
    const result = await pool.query(
      `
      SELECT 
        rci.*,
        rc.title,
        s.subject_code,
        s.subject_name,
        s.units,
        p.first_name,
        p.last_name
      FROM report_card_items rci
      JOIN report_cards rc ON rci.report_card_id = rc.id
      JOIN subjects s ON rci.subject_id = s.id
      LEFT JOIN professors p ON rci.professor_id = p.id
      WHERE rci.id = $1 AND rci.report_card_id = $2
      `,
      [id, report_id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Item not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch item',
    })
  }
}

export const getItemsByReportCard = async (req, res) => {
  const { report_id } = req.params

  try {
    const result = await pool.query(
      `
      SELECT 
        rci.*,
        s.subject_code,
        s.subject_name,
        s.units,
        p.first_name,
        p.last_name
      FROM report_card_items rci
      JOIN subjects s ON rci.subject_id = s.id
      LEFT JOIN professors p ON rci.professor_id = p.id
      WHERE rci.report_card_id = $1
      `,
      [report_id],
    )

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch items',
    })
  }
}

export const createReportCardItem = async (req, res) => {
  const { report_id } = req.params
  const { subject_id, grade, professor_id, remarks } = req.body

  if (!subject_id || grade === undefined) {
    return res.status(400).json({
      message: 'subject_id and grade are required',
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO report_card_items (
        report_card_id,
        subject_id,
        grade,
        professor_id,
        remarks
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [report_id, subject_id, grade, professor_id, remarks],
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
      message: 'Failed to create item',
    })
  }
}

export const updateReportCardItem = async (req, res) => {
  const { id, report_id } = req.params
  const { subject_id, grade, professor_id, remarks } = req.body

  if (!subject_id && grade === undefined && !professor_id && !remarks) {
    return res.status(400).json({
      message: 'No fields to update',
    })
  }

  try {
    const result = await pool.query(
      `
      UPDATE report_card_items
      SET subject_id = COALESCE($1, subject_id),
          grade = COALESCE($2, grade),
          professor_id = COALESCE($3, professor_id),
          remarks = COALESCE($4, remarks),
          updated_at = NOW()
      WHERE id = $5 AND report_card_id = $6
      RETURNING *
      `,
      [subject_id, grade, professor_id, remarks, id, report_id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Item not found',
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
      message: 'Failed to update item',
    })
  }
}

export const deleteReportCardItem = async (req, res) => {
  const { id, report_id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM report_card_items WHERE id = $1 AND report_card_id = $2 RETURNING *`,
      [id, report_id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Item not found',
      })
    }

    res.json({
      message: 'Item deleted successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to delete item',
    })
  }
}
