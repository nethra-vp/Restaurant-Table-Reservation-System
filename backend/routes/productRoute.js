import express from "express";
import db from "../config/db.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// ------------------ ADD PRODUCT ------------------
router.post("/add", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const image = req.file ? req.file.filename : null;

      // Validate required fields
      if (!name || !price) {
        return res.json({ success: false, message: 'Product name and price are required' });
      }

      // Validate name length
      if (name.trim().length === 0 || name.length > 100) {
        return res.json({ success: false, message: 'Product name must be 1-100 characters' });
      }

      // Validate price is a positive number
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return res.json({ success: false, message: 'Price must be a positive number' });
      }

      if (priceNum > 100000) {
        return res.json({ success: false, message: 'Price cannot exceed 100000' });
      }

    const sql = `
      INSERT INTO products (product_name, product_price, product_description, product_category, product_image)
      VALUES (?, ?, ?, ?, ?)
    `;

      await db.query(sql, [name, priceNum, description, category, image]);

    res.json({ success: true, message: "Product added successfully" });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
});

// ------------------ LIST PRODUCTS ------------------
router.get("/list", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        product_id AS id,
        product_name AS name,
        product_description AS description,
        product_category AS category,
        product_price AS price,
        product_image AS image,
        created_at AS createdAt
      FROM products
    `);

    res.json({ success: true, products: rows });
  } catch (error) {
    console.error("LIST PRODUCTS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

// ------------------ REMOVE PRODUCT ------------------
router.post("/remove", adminAuth, async (req, res) => {
  try {
    const { id } = req.body;

    await db.query(`DELETE FROM products WHERE product_id = ?`, [id]);

    res.json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    console.error("REMOVE PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to remove product" });
  }
});

// ------------------ SINGLE PRODUCT ------------------
router.get("/single", async (req, res) => {
  try {
    const { id } = req.query;

    const [rows] = await db.query(`
      SELECT
        product_id AS id,
        product_name AS name,
        product_description AS description,
        product_category AS category,
        product_price AS price,
        product_image AS image,
        created_at AS createdAt
      FROM products
      WHERE product_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product: rows[0] });
  } catch (error) {
    console.error("GET SINGLE PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
});

export default router;
