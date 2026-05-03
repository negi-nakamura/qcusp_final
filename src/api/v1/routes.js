import express from "express";
import healthRoutes from "../../routes/healthRoute.js";
import authRoutes from "../../routes/authRoute.js";
import newsRoutes from "../../routes/newsRoute.js";
import campusRoutes from "../../routes/campusRoute.js";
import courseRoutes from "../../routes/courseRoute.js";
import subjectRoute from "../../routes/subjectRoute.js";
import subjectCourseRoute from "../../routes/subjectCourseRoute.js";
import subjectOfferingRoute from "../../routes/subjectOfferingRoute.js";
import professorRoute from "../../routes/professorRoute.js";
import reportCardRoute from "../../routes/reportCardRoute.js";
import reportCardItemRoute from "../../routes/reportCardItemRoute.js";
import sessionRoute from "../../routes/sessionRoute.js";
import studentRoute from "../../routes/studentRoute.js";
import holidayCalendarRoute from "../../routes/holidayCalendarRoute.js";
import universityCalendarRoute from "../../routes/universityCalendarRoute.js";
import adminRoutes from "../../routes/adminRoute.js";

const router = express.Router();

router.use("/", healthRoutes);
router.use("/admins", adminRoutes);
router.use("/auth", authRoutes);
router.use("/news", newsRoutes);
router.use("/campuses", campusRoutes);
router.use("/courses", courseRoutes);
router.use("/subjects", subjectRoute);
router.use("/professors", professorRoute);
router.use("/subject-courses", subjectCourseRoute);
router.use("/subject-offerings", subjectOfferingRoute);
router.use("/report-cards", reportCardRoute);
router.use("/report-cards/:report_id/items", reportCardItemRoute);
router.use("/sessions", sessionRoute);
router.use("/students", studentRoute);
router.use("/calendar", holidayCalendarRoute)
router.use("/calendar", universityCalendarRoute)

export default router;
