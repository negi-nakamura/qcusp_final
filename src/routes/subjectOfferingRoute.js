import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as subjectOfferingController from "../controllers/subjectOfferingController.js"

const router = express.Router()

router.get("/", authenticate, subjectOfferingController.getAllSubjectOfferings)
router.get("/:id", authenticate, subjectOfferingController.getSubjectOfferingById)
router.post("/", authenticate, subjectOfferingController.createSubjectOffering)
router.put("/:id", authenticate, subjectOfferingController.updateSubjectOffering)
router.delete("/:id", authenticate, subjectOfferingController.deleteSubjectOffering)
router.get("/student/:studentId", authenticate, subjectOfferingController.getSubjectOfferingsByStudentId)

export default router