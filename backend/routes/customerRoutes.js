import express from "express";
import Customer from "../models/customerModel.js";

const router = express.Router();

// Add new customer
router.post("/add", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    console.log('/api/customer/add payload:', { name, email, phone });
    const created = await Customer.create({ name, email, phone });
    const customerObj = created.get ? created.get() : created;
    res.json({
      success: true,
      message: "Customer added successfully!",
      customer: { id: customerObj.id, name: customerObj.name, email: customerObj.email, phone: customerObj.phone },
    });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ success: false, message: "Failed to add customer", error });
  }
});

// Get all customers
router.get("/list", async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json({ success: true, customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch customers", error });
  }
});

// Delete a customer and their related reservations/orders
router.delete("/remove/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log('DELETE customer request received for ID:', id);
    const customer = await Customer.findByPk(id);
    console.log('Customer found:', customer ? `${customer.name} (ID: ${customer.id})` : 'NOT FOUND');
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    await customer.destroy();
    console.log('Customer deleted successfully');
    res.json({ success: true, message: "Customer removed successfully" });
  } catch (error) {
    console.error("Error removing customer:", error);
    if (error.message.includes("foreign key")) {
      return res.status(400).json({ success: false, message: "Cannot delete customer with existing reservations or orders. Delete those first." });
    }
    res.status(500).json({ success: false, message: "Failed to remove customer", error: error.message });
  }
});

export default router;
