import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as reportCardController from "../controllers/reportCardController.js"

const router = express.Router()

router.get("/", authenticate, reportCardController.getAllReportCards)
router.get("/:id", authenticate, reportCardController.getReportCardById)
router.get('/student/:student_id', authenticate, reportCardController.getReportCardsByStudentId);
router.post("/", authenticate, reportCardController.createReportCard)
router.put("/:id", authenticate, reportCardController.updateReportCard)
router.delete("/:id", authenticate, reportCardController.deleteReportCard)

export default router