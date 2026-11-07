import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
	getNotifications,
	markNotificationAsRead,
} from "../controller/notificationController.js";

const router = express.Router();

// Return only the authenticated user's notifications.
router.get("/", authenticate, getNotifications);

// Mark one notification as read after the user opens it.
router.patch("/:id/read", authenticate, markNotificationAsRead);

export default router;