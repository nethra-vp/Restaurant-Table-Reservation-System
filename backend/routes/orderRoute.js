import express from "express";
import { createOrder, getOrders, deleteOrder } from "../controllers/orderControllers.js";

const router = express.Router();

// Create a new order
router.post("/create", createOrder);

// List orders (optional ?customerId=)
router.get("/list", getOrders);

// Delete order
router.delete("/delete/:id", deleteOrder);

export default router;
