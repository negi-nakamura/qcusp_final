import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as studentController from "../controllers/studentController.js"

const router = express.Router()

router.get("/", authenticate, studentController.getAllStudents)
router.get("/:id", authenticate, studentController.getStudentById)
router.post("/", authenticate, studentController.createStudent)
router.put("/:id", authenticate, studentController.updateStudent)
router.delete("/:id", authenticate, studentController.deleteStudent)
router.get("/user/:userId", studentController.getStudentByUserId)

export default router