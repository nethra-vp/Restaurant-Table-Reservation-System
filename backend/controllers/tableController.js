import Table from "../models/tableModel.js";

export const toggleTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const table = await Table.findById(id);

    if (!table) {
      return res.status(404).json({ success: false, message: "Table not found" });
    }

    // Toggle status
    table.status = table.status === "Available" ? "Reserved" : "Available";
    await table.save();

    res.json({ success: true, message: "Table status updated", table });
  } catch (error) {
    console.error("Error toggling table status:", error);
    res.status(500).json({ success: false, message: "Error updating table status" });
  }
};
