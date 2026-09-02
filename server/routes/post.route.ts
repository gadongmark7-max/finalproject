import { Router } from "express";
import { PostController } from "../controller/posts.controller";
import { authenticateJWT } from "../middleware/auth";
import { upload } from "../utils/upload";

const route = Router()

route.post("/", authenticateJWT, upload.single("file")  ,PostController.addPost)
route.get("/", PostController.getAllPosts)
route.get("/:id", authenticateJWT, PostController.getPostById)
route.get("/account/:id", authenticateJWT, PostController.getAccountPosts)
route.delete("/:id", authenticateJWT, PostController.deletePostById)
route.put("/:id", authenticateJWT, PostController.updatePost)

export default route