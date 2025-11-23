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

// GET all reservations, with optional date filter for admin dashboard
router.get("/get", async (req, res, next) => {
  // If ?date=YYYY-MM-DD is provided, filter by date
  if (req.query.date) {
    req.query.date = req.query.date.trim();
    req.query.date = req.query.date.split('T')[0]; // Ensure only date part
    req.dateFilter = req.query.date;
    // Use controller with date filter
    return getReservations(req, res, next);
  }
  return getReservations(req, res, next);
});

// DELETE reservation
router.delete("/delete/:id", deleteReservation);

export default router;
