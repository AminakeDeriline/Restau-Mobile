import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import { createReservation } from "../controller/reservationController.js";

const router = express.Router();

// Route to create a new reservation, protected by authentication middleware
router.post("/", authenticate, createReservation);

export default router;