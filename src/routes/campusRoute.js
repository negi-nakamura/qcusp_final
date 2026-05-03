import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as campusController from "../controllers/campusController.js"

const router = express.Router()

router.get("/", authenticate, campusController.getAllCampuses)
router.get("/:id", authenticate, campusController.getCampusById)
router.post("/", authenticate, campusController.createCampus)
router.put("/:id", authenticate, campusController.updateCampus)
router.delete("/:id", authenticate, campusController.deleteCampus)

export default router