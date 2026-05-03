import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as subjectController from "../controllers/subjectController.js"

const router = express.Router()

router.get("/", authenticate, subjectController.getAllSubjects)
router.get("/:id", authenticate, subjectController.getSubjectById)
router.post("/", authenticate, subjectController.createSubject)
router.put("/:id", authenticate, subjectController.updateSubject)
router.delete("/:id", authenticate, subjectController.deleteSubject)

export default router