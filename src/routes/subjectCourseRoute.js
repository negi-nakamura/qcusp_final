import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as subjectCourseController from "../controllers/subjectCourseController.js"

const router = express.Router()

router.get("/", authenticate, subjectCourseController.getAllSubjectCourses)
router.get("/:id", authenticate, subjectCourseController.getSubjectCourseById)
router.post("/", authenticate, subjectCourseController.createSubjectCourse)
router.put("/:id", authenticate, subjectCourseController.updateSubjectCourse)
router.delete("/:id", authenticate, subjectCourseController.deleteSubjectCourse)

export default router