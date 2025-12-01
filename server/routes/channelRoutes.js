import express from "express";
import {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
} from "../controllers/channelController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getChannels).post(protect, admin, createChannel);

router.route("/:id").put(protect, admin, updateChannel).delete(protect, admin, deleteChannel);

export default router;
