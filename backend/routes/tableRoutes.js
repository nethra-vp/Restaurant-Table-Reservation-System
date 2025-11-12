import express from "express";
import Table from "../models/tableModel.js";

const router = express.Router();

// Add new table
router.post("/add", async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.json({ success: false, message: "Table number already exists" });
    }

    const table = new Table({ tableNumber, capacity });
    await table.save();

    res.json({ success: true, message: "Table added successfully", table });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add table" });
  }
});

// List all tables
router.get("/list", async (req, res) => {
  try {
    const tables = await Table.find();
    res.json({ success: true, tables });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch tables" });
  }
});

// Toggle table status
router.patch("/toggle/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const table = await Table.findById(id)

    if(!table) {
      return res.status(404).json({success: false, message: "Table not found"})
    }

    table.status = table.status === "Available" ? "Reserved" : "Available"
    await table.save()

    res.json({success: true, message: "Table status updated", table})
  } catch (error) {
    console.error("Error toggling table status:", error);
    res.status(500).json({ success: false, message: "Error updating table status", error});
  }
})

// Delete a table
router.delete("/remove/:id", async (req, res) => {
    try {
      await Table.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "Table removed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Failed to remove table", error});
    }
});

export default router;
