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
  // parse requested time slot into minutes since midnight
  function parseSlot(slot) {
    // expected format: "H:MM AM - H:MM PM" or similar
    const parts = slot.split('-').map(s => s.trim());
    const toMinutes = (t) => {
      const [time, period] = t.split(' ');
      const [h, m] = time.split(':').map(Number);
      let hour = h % 12;
      if (period.toUpperCase() === 'PM') hour += 12;
      return hour * 60 + (m || 0);
    }
    try {
      const start = toMinutes(parts[0]);
      const end = toMinutes(parts[1]);
      return { start, end };
    } catch (e) {
      return null;
    }
  }

  const reqSlot = parseSlot(time);

  const tables = await Table.findAll({
    where: { capacity: { [Op.gte]: guests }, status: 'Available' },
    order: [["capacity", "ASC"]],
  });

  // check each table for overlapping reservations on the same date
  for (const table of tables) {
    const existing = await Reservation.findAll({ where: { tableId: table.id, date } });
    let conflict = false;
      for (const ex of existing) {
      const exSlot = parseSlot(ex.time);
      // If either slot cannot be parsed, treat as a conflict to avoid double-booking
      if (!reqSlot || !exSlot) {
        conflict = true;
        break;
      }
      // overlap if not (newEnd <= exStart || newStart >= exEnd)
      if (!(reqSlot.end <= exSlot.start || reqSlot.start >= exSlot.end)) {
        conflict = true;
        break;
      }
    }
    if (!conflict) return table;
  }

  return null;
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

    // Auto table assign (per date + time slot)
    const table = await findSmallestAvailableTable(guests, date, time);
    let reservationStatus = 'confirmed';
    let assignedTableId = null;
    if (!table) {
      // No suitable table for that date/time — place on waiting list
      reservationStatus = 'waiting';
    } else {
      assignedTableId = table.id;
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
      tableId: assignedTableId,
      customerId: customer.id,
      status: reservationStatus,
    });

    // If confirmed, mark the table as Reserved and return assigned table details.
    const response = { reservation: { ...mapId(reservation) } };
    if (assignedTableId) {
      // Update the table status to Reserved
      await table.update({ status: "Reserved" });
      // return the updated table info
      response.reservation.table = {
        _id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
      };
    } else {
      response.reservation.message = 'Added to waiting list for selected slot';
    }

    res.status(201).json(response);
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
