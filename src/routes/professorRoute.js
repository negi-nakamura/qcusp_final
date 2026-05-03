import express from "express"
import { authenticate } from "../middleware/authenticationMiddleware.js"
import * as professorController from "../controllers/professorController.js"

const router = express.Router()

router.get("/", authenticate, professorController.getAllProfessors)
router.get("/:id", authenticate, professorController.getProfessorById)
router.post("/", authenticate, professorController.createProfessor)
router.put("/:id", authenticate, professorController.updateProfessor)
router.delete("/:id", authenticate, professorController.deleteProfessor)

export default router