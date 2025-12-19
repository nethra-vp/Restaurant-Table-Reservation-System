import express from "express";
import {
  createReservation,
  getReservations,
  deleteReservation,
  cancelReservationByToken,
  cancelReservationPage,
} from "../controllers/reservationControllers.js";

const router = express.Router();

// CREATE reservation
router.post("/create", createReservation);

// GET all reservations, with optional date filter for admin dashboard
router.get("/get", async (req, res, next) => {
  if (req.query.date) {
    req.query.date = req.query.date.trim();
    req.query.date = req.query.date.split('T')[0];
    req.dateFilter = req.query.date;
    // Use controller with date filter
    return getReservations(req, res, next);
  }
  return getReservations(req, res, next);
});

// DELETE reservation
router.delete("/delete/:id", deleteReservation);

// CANCEL reservation by token
router.delete('/cancel/:token', cancelReservationByToken);
// Allow GET from email link (browser click) to perform cancellation and show JSON response
router.get('/cancel/:token', cancelReservationPage);

export default router;
