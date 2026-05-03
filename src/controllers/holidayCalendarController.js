import axios from 'axios'

export const getAllHolidays = async (req, res) => {
  const { year } = req.query

  try {
    const selectedYear = year || new Date().getFullYear()

    const response = await axios.get(
      `https://date.nager.at/api/v3/PublicHolidays/${selectedYear}/PH`
    )

    const holidays = response.data.map((holiday) => ({
      date: holiday.date,
      title: holiday.name,
      event_type: 'holiday',
      source: 'Holiday'
    }))

    res.status(200).json({
      success: true,
      total_holidays: holidays.length,
      holidays
    })

  } catch (error) {
    console.error(error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays',
    })
  }
}