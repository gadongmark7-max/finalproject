import { Router } from "express";
import { ArtistController } from "../controller/artist.controller";
import { authenticateJWT } from "../middleware/auth";

const route = Router();

route.get("/dashboard", authenticateJWT, ArtistController.getDashboard);
route.get("/reports", authenticateJWT, ArtistController.getReports);

route.get("/expenses", authenticateJWT, ArtistController.listExpenses);
route.post("/expenses", authenticateJWT, ArtistController.createExpense);
route.put("/expenses/:id", authenticateJWT, ArtistController.updateExpense);
route.delete("/expenses/:id", authenticateJWT, ArtistController.deleteExpense);

export default route;
