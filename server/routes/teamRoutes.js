import express from "express";
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getAreas,
} from "../controllers/teamController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/areas", protect, getAreas);

router.route("/").get(protect, getTeams).post(protect, admin, upload.single("photo"), createTeam);

router
  .route("/:id")
  .put(protect, admin, upload.single("photo"), updateTeam)
  .delete(protect, admin, deleteTeam);

export default router;
