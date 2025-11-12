import express from "express";
import Customer from "../models/customerModel.js";

const router = express.Router();

// Add new customer
router.post("/add", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const customer = new Customer({ name, email, phone });
    await customer.save();
    res.json({ success: true, message: "Customer added successfully!", customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add customer", error });
  }
});

// Get all customers
router.get("/list", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch customers", error });
  }
});

// Delete a customer
router.delete("/remove/:id", async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Customer removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove customer", error });
  }
});

export default router;
