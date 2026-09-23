import { Router } from "express";
import { PostController } from "../controller/posts.controller";
import { AiAnalysisController } from "../controller/aiAnalysis.controller";
import { authenticateJWT } from "../middleware/auth";
import { upload, aiImageUpload } from "../utils/upload";

const route = Router();

route.post(
  "/ai-analysis",
  authenticateJWT,
  aiImageUpload,
  AiAnalysisController.analyzeTattoo,
);
route.post(
  "/ai-analysis/reprice",
  authenticateJWT,
  AiAnalysisController.repriceTattoo,
);
route.post(
  "/ai-estimate",
  authenticateJWT,
  aiImageUpload,
  AiAnalysisController.estimateForClient,
);
route.post(
  "/ai-estimate/reprice",
  authenticateJWT,
  AiAnalysisController.repriceForClient,
);
route.post("/", authenticateJWT, upload.single("file"), PostController.addPost);
route.get("/", PostController.getAllPosts);
route.get("/:id", authenticateJWT, PostController.getPostById);
route.get("/account/:id", authenticateJWT, PostController.getAccountPosts);
route.get(
  "/account/:id/deleted",
  authenticateJWT,
  PostController.getDeletedAccountPosts,
);
route.delete("/:id", authenticateJWT, PostController.deletePostById);
route.put("/:id", authenticateJWT, PostController.updatePost);
route.put("/:id/restore", authenticateJWT, PostController.restorePostById);

export default route;
