import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as universityCalendarController from "../controllers/universityCalendarController.js"

const router = express.Router()

router.get("/", universityCalendarController.getAllCalendars)
router.get("/university", universityCalendarController.getAllUniversityEvents)
router.get("/university/:calendarId", universityCalendarController.getUniversityEventsByCalendar)
router.post("/", universityCalendarController.createCalendar)
router.post("/create", universityCalendarController.createCalendarEvent)

export default router