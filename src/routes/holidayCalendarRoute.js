import express from "express";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import * as holidayCalendarController from "../controllers/holidayCalendarController.js";

const router = express.Router();

router.get("/holiday", authenticate, holidayCalendarController.getAllHolidays);

export default router;