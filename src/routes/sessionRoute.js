import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as sessionsController from "../controllers/sessionController.js"

const router = express.Router()

router.get("/", authenticate, sessionsController.getAllSessions)
router.get("/:id", authenticate, sessionsController.getSessionById)
router.get("/user/:userId", authenticate, sessionsController.getSessionsByUser)
router.put("/logout/:id", authenticate, sessionsController.logoutSession)
router.put("/:id/deactivate", authenticate, sessionsController.deactivateSession)

export default router