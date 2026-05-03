import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as reportCardItemController from "../controllers/reportCardItemController.js"

const router = express.Router({ mergeParams: true })

router.get("/", authenticate, reportCardItemController.getItemsByReportCard)
router.get("/:id", authenticate, reportCardItemController.getReportCardItemById)
router.post("/", authenticate, reportCardItemController.createReportCardItem)
router.put("/:id", authenticate, reportCardItemController.updateReportCardItem)
router.delete("/:id", authenticate, reportCardItemController.deleteReportCardItem)

export default router