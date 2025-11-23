// routes/reservationRoutes.js
import express from "express";
import {
  createReservation,
  getReservations,
  deleteReservation,
} from "../controllers/reservationControllers.js";

const router = express.Router();

// CREATE reservation
router.post("/create", createReservation);

// GET all reservations
router.get("/get", getReservations);

// DELETE reservation
router.delete("/delete/:id", deleteReservation);

export default router;
