import reservationModels from "../models/reservationModels.js";
import Customer from "../models/customerModel.js";
import Table from "../models/tableModel.js";

// CREATE Reservation
export const createReservation = async (req, res) => {
  try {
    const { name, email, phone, date, time, guests } = req.body;

    // basic validation
    if (!name || !email || !phone || !date || !time || !guests) {
      return res.json({ success: false, message: "All fields are required" });
    }

    // Prevent selecting a past date
    const today = new Date();
    const selectedDate = new Date(date);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.json({
        success: false,
        message: "Reservation date cannot be in the past",
      });
    }

    // find smallest available table that fits guests
    const table = await Table.findOne({
      status: "Available",
      capacity: { $gte: guests },
    }).sort({ capacity: 1 });

    if (!table) {
      return res.json({
        success: false,
        message: "No available table for this number of guests",
      });
    }

    // reserve that table
    table.status = "Reserved";
    await table.save();

    // save reservation with table reference
    const reservation = new reservationModels({
      name,
      email,
      phone,
      date,
      time,
      guests,
      table: table._id,
    });
    await reservation.save();

    // add customer if not exists
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }],
    });

    if (!existingCustomer) {
      const newCustomer = new Customer({ name, email, phone });
      await newCustomer.save();
    }

    return res.status(201).json({
      success: true,
      message: "Reservation created successfully and table reserved",
      reservation,
      table,
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return res.status(500).json({ success: false, message: "Error creating reservation" });
  }
};

// GET all reservations (populates table)
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await reservationModels.find().populate("table");
    return res.json({ success: true, reservations });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return res.status(500).json({ success: false, message: "Error fetching reservations" });
  }
};

// DELETE reservation and free table
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await reservationModels.findById(id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: "Reservation not found" });
    }

    // free table if assigned
    if (reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, { status: "Available" });
    }

    await reservationModels.findByIdAndDelete(id);

    return res.json({ success: true, message: "Reservation removed and table freed" });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return res.status(500).json({ success: false, message: "Error deleting reservation" });
  }
};