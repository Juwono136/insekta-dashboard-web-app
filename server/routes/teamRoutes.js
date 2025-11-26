import express from "express";
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getAreas,
} from "../controllers/teamController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/areas", protect, getAreas);

router
  .route("/")
  .get(protect, getTeams) // Client perlu akses GET juga
  .post(protect, admin, upload.single("photo"), createTeam);

router
  .route("/:id")
  .put(protect, admin, upload.single("photo"), updateTeam)
  .delete(protect, admin, deleteTeam);

export default router;
