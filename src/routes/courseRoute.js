import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as courseController from "../controllers/courseController.js"

const router = express.Router()

router.get("/", authenticate, courseController.getAllCourses)
router.get("/:id", authenticate, courseController.getCourseById)
router.post("/", authenticate, courseController.createCourse)
router.put("/:id", authenticate, courseController.updateCourse)
router.delete("/:id", authenticate, courseController.deleteCourse)

export default router