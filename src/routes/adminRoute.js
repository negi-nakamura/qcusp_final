import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as adminController from "../controllers/adminController.js"

const router = express.Router()

router.get("/", adminController.getAllAdmins)

/* 🔥 same pattern as student */
router.get("/user/:userId", adminController.getAdminByUserId)

router.get("/:id", adminController.getAdminById)

router.post("/", authenticate, adminController.createAdmin)
router.put("/:id", authenticate, adminController.updateAdmin)
router.delete("/:id", authenticate, adminController.deleteAdmin)

export default router