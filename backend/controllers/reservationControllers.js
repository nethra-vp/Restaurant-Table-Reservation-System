// controllers/reservationControllers.js
import { Reservation } from "../models/reservationModels.js";
import { Table } from "../models/tableModel.js";
import { Op } from "sequelize";

// map Sequelize id → _id
function mapId(instance) {
  if (!instance) return null;
  return { ...instance.get(), _id: instance.id };
}

// ----------- AUTO-ASSIGN TABLE ------------
async function findSmallestAvailableTable(guests, date, time) {
  const tables = await Table.findAll({
    where: { status: "Available", capacity: { [Op.gte]: guests } },
    order: [["capacity", "ASC"]],
  });

  return tables.length > 0 ? tables[0] : null;
}

// ----------- CREATE RESERVATION -----------
export const createReservation = async (req, res) => {
  try {
    console.log('Reservation request body:', req.body);
    const { name, email, phone, date, time, guests } = req.body;

    if (!name || !email || !phone || !date || !time || !guests) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Prevent past dates
    const today = new Date().setHours(0, 0, 0, 0);
    const reqDate = new Date(date).setHours(0, 0, 0, 0);
    if (reqDate < today) {
      return res.status(400).json({ message: "Cannot reserve past dates" });
    }

    // Auto table assign
    const table = await findSmallestAvailableTable(guests, date, time);
    if (!table) {
      return res.status(400).json({ message: "No suitable table available for the selected time and guest count" });
    }

    // Create or update customer
    const { Customer } = await import("../models/customerModel.js");
    let customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      customer = await Customer.create({ name, email, phone });
    } else {
      // Optionally update name/phone if changed
      await customer.update({ name, phone });
    }

    const reservation = await Reservation.create({
      name,
      email,
      phone,
      date,
      time,
      guests,
      tableId: table.id,
      customerId: customer.id,
    });

    // mark table as reserved
    await table.update({ status: "Reserved" });

    res.status(201).json(mapId(reservation));
  } catch (err) {
    res.status(500).json({ message: "Error creating reservation" });
  }
};

// ----------- GET ALL ----------------------
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [{ model: Table, as: "table" }],
      order: [["id", "DESC"]],
    });

    res.json({
      reservations: reservations.map((r) => ({
        ...mapId(r),
        table: mapId(r.table),
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching reservations" });
  }
};

// ----------- DELETE -----------------------
export const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation)
      return res.status(404).json({ message: "Reservation not found" });

    const table = await Table.findByPk(reservation.tableId);

    await reservation.destroy();

    // free table
    if (table) await table.update({ status: "Available" });

    res.json({ message: "Reservation deleted", _id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Error deleting reservation" });
  }
};
