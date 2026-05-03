import pool from "../config/db.js"

export const getAllCalendars = async (req, res) => {
  const { limit } = req.query

  try {
    const result = await pool.query(`
      SELECT *
      FROM calendar
      ORDER BY semester_end DESC
      ${limit ? `LIMIT ${limit}` : ""}
    `)

    return res.status(200).json({
      success: true,
      calendars: result.rows,
    })
  } catch (error) {
    console.error(error.message)

    return res.status(500).json({
      success: false,
      message: "Failed to fetch calendars",
    })
  }
}

export const getAllUniversityEvents = async (req, res) => {
  const { school_year, semester } = req.query

  try {
    let query = `
      SELECT 
        ce.id,
        ce.title,
        ce.start_date,
        ce.end_date,
        ce.event_type,
        ce.calendar_id,
        c.school_year,
        c.semester,
        c.semester_start,
        c.semester_end,
        c.url
      FROM calendar_event ce
      LEFT JOIN calendar c ON ce.calendar_id = c.id
      WHERE 1=1
    `

    const values = []
    let i = 1

    if (school_year) {
      query += ` AND c.school_year = $${i}`
      values.push(school_year)
      i++
    }

    if (semester) {
      query += ` AND c.semester = $${i}`
      values.push(semester)
      i++
    }

    query += ` ORDER BY ce.start_date ASC`

    const result = await pool.query(query, values)

    const first = result.rows[0]

    const meta = first
      ? {
          calendar_id: first.calendar_id,
          school_year: first.school_year,
          semester: first.semester,
          semester_start: first.semester_start,
          semester_end: first.semester_end,
          url: first.url,
        }
      : null

    const events = result.rows.map(
      ({
        school_year,
        semester,
        semester_start,
        semester_end,
        url,
        ...event
      }) => event
    )

    return res.status(200).json({
      success: true,
      meta,
      total: events.length,
      events,
    })
  } catch (error) {
    console.error(error.message)

    return res.status(500).json({
      success: false,
      message: "Failed to fetch university events",
    })
  }
}

export const getUniversityEventsByCalendar = async (req, res) => {
  const { calendarId } = req.params

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM calendar_event
      WHERE calendar_id = $1
      ORDER BY start_date ASC
      `,
      [calendarId]
    )

    return res.status(200).json({
      success: true,
      events: result.rows,
    })
  } catch (error) {
    console.error(error.message)

    return res.status(500).json({
      success: false,
      message: "Failed to fetch calendar events",
    })
  }
}

export const createCalendar = async (req, res) => {
  const { school_year, semester, semester_start, semester_end, url } = req.body

  if (!school_year || !semester || !semester_start || !semester_end) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO calendar (
        school_year,
        semester,
        semester_start,
        semester_end,
        url
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [school_year, semester, semester_start, semester_end, url]
    )

    return res.status(201).json({
      success: true,
      calendar: result.rows[0],
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      message: "Failed to create calendar",
    })
  }
}

export const createCalendarEvent = async (req, res) => {
  const { calendar_id, title, start_date, end_date, event_type } = req.body

  if (!calendar_id || !title || !start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO calendar_event (
        calendar_id,
        title,
        start_date,
        end_date,
        event_type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [calendar_id, title, start_date, end_date, event_type || "event"]
    )

    return res.status(201).json({
      success: true,
      event: result.rows[0],
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      message: "Failed to create event",
    })
  }
}