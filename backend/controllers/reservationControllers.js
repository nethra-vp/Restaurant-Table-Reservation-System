// controllers/reservationControllers.js
import { Reservation } from "../models/reservationModels.js";
import { Table } from "../models/tableModel.js";
import { Customer } from "../models/customerModel.js";
import { Op } from "sequelize";
import crypto from 'crypto';
import { sendCancellationEmail, sendConfirmationEmail } from '../utils/mailer.js';

// map Sequelize id → _id
function mapId(instance) {
  if (!instance) return null;
  return { ...instance.get(), _id: instance.id };
}

function formatTimeTo12(timeStr) {
  if (!timeStr) return '';
  // timeStr expected as HH:MM or HH:MM:SS
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1; // converts 0->12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
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
    // If a table was assigned, generate a cancellation token valid for 5 minutes and send email.
    let cancellationToken = null;
    let cancellationTokenExpiry = null;
    if (assignedTableId) {
      cancellationToken = crypto.randomBytes(32).toString('hex');
      cancellationTokenExpiry = new Date(Date.now() + 2 * 60 * 1000); // 5 minutes
    }

    const reservation = await Reservation.create({
      customerId: customer.id,
      tableId: assignedTableId,
      date,
      time,
      guests,
      cancellationToken,
      cancellationTokenExpiry,
    });

    // If confirmed, mark the table as Reserved and return assigned table details.
    const response = { reservation: { ...mapId(reservation) } };
    // include customer info on response for frontend convenience
    response.reservation.name = customer.name;
    response.reservation.email = customer.email;
    response.reservation.phone = customer.phone;
    // include formatted time
    response.reservation.formattedTime = formatTimeTo12(reservation.time || time);
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
      // send confirmation email (includes cancellation link valid for 5 minutes)
      try {
        const cancelLink = await sendConfirmationEmail(customer.email, cancellationToken, { date, time: formatTimeTo12(time), guests });
        // expose cancel link in response for development/testing when SMTP is not configured
        if (cancelLink) response.reservation.cancelLink = cancelLink;
      } catch (err) {
        console.error('Failed to send confirmation email:', err);
      }
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
        // provide a human-friendly 12-hour time string for UI
        formattedTime: formatTimeTo12(r.time),
        cancellationToken: r.cancellationToken || null,
        cancellationTokenExpiry: r.cancellationTokenExpiry || null,
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

// ----------- CANCEL BY TOKEN ----------------
async function performCancellationByToken(token) {
  if (!token) return { ok: false, code: 'missing', message: 'Token required' };

  const reservation = await Reservation.findOne({ where: { cancellationToken: token } });
  if (!reservation) return { ok: false, code: 'not_found', message: 'Invalid cancellation token' };

  const now = new Date();
  const expiry = reservation.cancellationTokenExpiry ? new Date(reservation.cancellationTokenExpiry) : null;
  if (!expiry || now > expiry) {
    return { ok: false, code: 'expired', message: 'Expired link or cancellation window closed' };
  }

  const table = await Table.findByPk(reservation.tableId);
  const tableInfo = table ? { id: table.id, tableNumber: table.tableNumber } : null;

  // capture reservation id to return after deletion
  const reservationId = reservation.id;

  await reservation.destroy();
  if (table) await table.update({ status: 'Available' });

  return { ok: true, code: 'cancelled', message: 'Reservation cancelled successfully', reservationId, table: tableInfo };
}

export const cancelReservationByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await performCancellationByToken(token);
    if (!result.ok) {
      const status = result.code === 'expired' || result.code === 'missing' ? 400 : 404;
      return res.status(status).json({ message: result.message });
    }
    return res.json({ success: true, message: result.message });
  } catch (err) {
    console.error('Error cancelling by token:', err);
    return res.status(500).json({ message: 'Error cancelling reservation' });
  }
};

// Render a friendly HTML page when customer clicks cancellation link
export const cancelReservationPage = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await performCancellationByToken(token);

    // Simple HTML styled to match admin UI colors (amber)
    const frontUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (!result.ok) {
      const message = result.message || 'Unable to cancel reservation';
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Cancellation</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Inter,system-ui,Arial,sans-serif;background:#f8fafc;color:#0f172a;display:flex;align-items:center;justify-content:center;height:100vh;margin:0} .card{background:#fff;padding:28px;border-radius:10px;box-shadow:0 6px 18px rgba(15,23,42,0.08);max-width:600px;text-align:center} .title{color:#92400e;font-weight:700;margin-bottom:12px} .msg{margin-bottom:18px} .btn{display:inline-block;padding:10px 20px;background:#f59e0b;color:#fff;border-radius:8px;text-decoration:none;font-weight:600}</style></head><body><div class="card"><h1 class="title">Cancellation</h1><p class="msg">${message}</p><a class="btn" href="${frontUrl}">Return to site</a></div></body></html>`;
      return res.status(result.code === 'expired' ? 400 : 404).send(html);
    }

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Reservation Cancelled</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Inter,system-ui,Arial,sans-serif;background:#f8fafc;color:#0f172a;display:flex;align-items:center;justify-content:center;height:100vh;margin:0} .card{background:#fff;padding:28px;border-radius:10px;box-shadow:0 6px 18px rgba(15,23,42,0.08);max-width:600px;text-align:center} .title{color:#92400e;font-weight:700;margin-bottom:12px} .msg{margin-bottom:18px} .btn{display:inline-block;padding:10px 20px;background:#f59e0b;color:#fff;border-radius:8px;text-decoration:none;font-weight:600}</style></head><body><div class="card"><h1 class="title">Reservation Cancelled</h1><p class="msg">Your reservation has been cancelled successfully.</p><a class="btn" href="${frontUrl}">Return to site</a></div></body></html>`;
    return res.send(html);
  } catch (err) {
    console.error('Error rendering cancel page:', err);
    return res.status(500).send('<h1>Server error</h1>');
  }
};
