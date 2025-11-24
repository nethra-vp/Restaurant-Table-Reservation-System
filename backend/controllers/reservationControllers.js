// controllers/reservationControllers.js
import { Reservation } from "../models/reservationModels.js";
import { Table } from "../models/tableModel.js";
import { Customer } from "../models/customerModel.js";
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
    // Supported inputs:
    // - Range label like "11:00 AM - 12:00 PM"
    // - Simple time string like "11:00" or "11:00:00" (24h)
    if (!slot) return null;
    // If range with '-' present, parse AM/PM parts
    if (slot.includes('-')) {
      const parts = slot.split('-').map(s => s.trim());
      const toMinutes = (t) => {
        const [timePart, period] = t.split(' ').length === 2 ? t.split(' ') : [t, null];
        const [h, m] = timePart.split(':').map(Number);
        let hour = h || 0;
        if (period) {
          hour = h % 12;
          if (period.toUpperCase() === 'PM') hour += 12;
        }
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

    // Otherwise assume a single time (HH:MM or HH:MM:SS), treat as start, 1 hour slot
    const timeOnly = slot.trim();
    const [hStr, mStr] = timeOnly.split(':');
    const h = Number(hStr || 0);
    const m = Number(mStr || 0);
    if (isNaN(h) || isNaN(m)) return null;
    const start = h * 60 + m;
    const end = start + 60; // default 1 hour slot
    return { start, end };
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
    let assignedTableId = null;
    if (table) assignedTableId = table.id;

    // Create or update customer
    const { Customer } = await import("../models/customerModel.js");
    let customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      customer = await Customer.create({ name, email, phone });
    } else {
      // Optionally update name/phone if changed
      await customer.update({ name, phone });
    }

    // Store reservation referencing customer and table (if assigned). Time is stored as TIME/string per DB schema.
    const reservation = await Reservation.create({
      customerId: customer.id,
      tableId: assignedTableId,
      date,
      time,
      guests,
    });

    // If confirmed, mark the table as Reserved and return assigned table details.
    const response = { reservation: { ...mapId(reservation) } };
    // include customer info on response for frontend convenience
    response.reservation.name = customer.name;
    response.reservation.email = customer.email;
    response.reservation.phone = customer.phone;
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
      include: [
        { model: Table, as: "table" },
        { model: Customer, as: "customer" }
      ],
      order: [["id", "DESC"]],
    });

    res.json({
      reservations: reservations.map((r) => ({
        ...mapId(r),
        table: mapId(r.table),
        // expose customer details flattened for frontend compatibility
        name: r.customer?.name || null,
        email: r.customer?.email || null,
        phone: r.customer?.phone || null,
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
