// controllers/tableController.js
import { Table } from "../models/tableModel.js";
import { Reservation } from "../models/reservationModels.js";

// Helper
function mapId(instance) {
  if (!instance) return null;
  return { ...instance.get(), _id: instance.id };
}

// ---------------------- CREATE TABLE ----------------------
export const addTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    const exists = await Table.findOne({ where: { tableNumber } });
    if (exists) return res.status(400).json({ message: "Table already exists" });

    const table = await Table.create({
      tableNumber,
      capacity,
      status: "Available",
    });

    res.status(201).json(mapId(table));
  } catch (err) {
    res.status(500).json({ message: "Error creating table" });
  }
};

// ---------------------- GET ALL TABLES ----------------------
export const getTables = async (req, res) => {
  try {
    const tables = await Table.findAll({ order: [["tableNumber", "ASC"]] });
    res.json(tables.map(mapId));
  } catch (err) {
    res.status(500).json({ message: "Error fetching tables" });
  }
};

// ---------------------- UPDATE STATUS ----------------------
export const updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const table = await Table.findByPk(id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    await table.update({ status });

    res.json(mapId(table));
  } catch (err) {
    res.status(500).json({ message: "Error updating table" });
  }
};

// ---------------------- DELETE TABLE ----------------------
export const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    // prevent delete if reservation uses this table
    const active = await Reservation.findOne({ where: { tableId: table.id } });
    if (active)
      return res
        .status(400)
        .json({ message: "Cannot delete table with active reservations" });

    await table.destroy();
    res.json({ message: "Table deleted", _id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Error deleting table" });
  }
};
