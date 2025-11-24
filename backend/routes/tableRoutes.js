// routes/tableRoutes.js
import express from "express";
import { Table } from "../models/tableModel.js";

const router = express.Router();

// ------------------------------
// Create new table
// ------------------------------
router.post("/add", async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    console.log('API /api/table/add payload:', { tableNumber, capacity });

    // Check duplicate table number
    const existingTable = await Table.findOne({ where: { tableNumber } });
    if (existingTable) {
      return res.json({
        success: false,
        message: "Table number already exists",
      });
    }


    const table = await Table.create({ tableNumber, capacity });
    console.log('Created table (sequelize):', table.get());

    // Map id → _id
    const responseTable = { ...table.get(), _id: table.id };

    res.json({
      success: true,
      message: "Table added successfully",
      table: responseTable,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add table" });
  }
});

// ------------------------------
// List all tables
// ------------------------------
router.get("/list", async (req, res) => {
  try {
    const tables = await Table.findAll({ order: [["tableNumber", "ASC"]] });

    const formatted = tables.map((t) => ({
      ...t.get(),
      _id: t.id, // frontend expects _id
    }));

    res.json({ success: true, tables: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tables",
      error,
    });
  }
});

// ------------------------------
// Toggle table status
// ------------------------------
router.patch("/toggle/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id);
    if (!table) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }

    const newStatus =
      table.status === "Available" ? "Reserved" : "Available";

    await table.update({ status: newStatus });

    const responseTable = { ...table.get(), _id: table.id };

    res.json({
      success: true,
      message: "Table status updated",
      table: responseTable,
    });
  } catch (error) {
    console.error("Error toggling table status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating table status",
      error,
    });
  }
});

// ------------------------------
// Delete table
// ------------------------------
router.delete("/remove/:id", async (req, res) => {
  try {
    const deletedCount = await Table.destroy({
      where: { id: req.params.id },
    });

    if (!deletedCount) {
      return res.json({
        success: false,
        message: "Table not found",
      });
    }

    res.json({
      success: true,
      message: "Table removed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to remove table",
      error,
    });
  }
});

export default router;
