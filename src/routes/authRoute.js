import express from "express";
import { createLimiter } from "../middleware/rateLimiterMiddleware.js";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// const loginLimiter = createLimiter({
//   windowSeconds: 1 * 30, 
//   maxAttempts: 5, 
//   message: 'Too many login attempts. Please try again later.',
// })

const loginLimiter = createLimiter({
    windowMs: 1 * 60 * 1000, 
    maxAttempts: 5,
    message: 'Too many login attempts. Please try again later.',
});

router.post("/register", authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;