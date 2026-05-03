import express from "express";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import * as newsController from "../controllers/newsController.js";

const router = express.Router();

router.get("/", newsController.getAllPosts);
router.get("/:id", authenticate, newsController.getPostById);

router.post("/", authenticate, newsController.createPost);
router.put("/:id", authenticate, newsController.updatePost);
router.delete("/:id", authenticate, newsController.deletePost);

export default router;