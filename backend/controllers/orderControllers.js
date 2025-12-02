import db from "../config/db.js";

// Create an order: snapshot product price into unit_price
export const createOrder = async (req, res) => {
  try {
    const { customerId, productId, quantity = 1 } = req.body;

    if (!customerId || !productId) {
      return res.status(400).json({ success: false, message: 'customerId and productId are required' });
    }

    // Fetch product to snapshot price
    const [prodRows] = await db.query(
      `SELECT product_id, product_price FROM products WHERE product_id = ?`,
      [productId]
    );

    if (prodRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const unitPrice = prodRows[0].product_price;

    const [result] = await db.query(
      `INSERT INTO orders (customer_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
      [customerId, productId, quantity, unitPrice]
    );

    return res.json({ success: true, orderId: result.insertId });
  } catch (error) {
    console.error('CREATE ORDER ERROR:', error);
    return res.status(500).json({ success: false, message: 'Failed to create order', error: error.message, sqlError: error.sqlMessage || null });
  }
};

// List orders. Optional filter: ?customerId=NN
export const getOrders = async (req, res) => {
  try {
    const { customerId } = req.query;

    let sql = `
      SELECT
        o.order_id AS orderId,
        o.customer_id AS customerId,
        o.product_id AS productId,
        o.quantity,
        o.unit_price AS unitPrice,
        o.total_price AS totalPrice,
        NULL AS orderTime,
        p.product_name AS productName,
        c.customer_name AS customerName
      FROM orders o
      JOIN products p ON p.product_id = o.product_id
      JOIN customers c ON c.customer_id = o.customer_id
    `;

    const params = [];
    if (customerId) {
      sql += ` WHERE o.customer_id = ? `;
      params.push(customerId);
    }

    sql += ` ORDER BY o.order_id DESC `;

    const [rows] = await db.query(sql, params);

    // Group rows by customerId
    const grouped = {};
    for (const r of rows) {
      const cid = r.customerId;
      if (!grouped[cid]) {
        grouped[cid] = {
          customerId: cid,
          customerName: r.customerName,
          orders: [],
        };
      }
      grouped[cid].orders.push({
        orderId: r.orderId,
        productId: r.productId,
        productName: r.productName,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
        totalPrice: r.totalPrice,
        orderTime: r.orderTime,
      });
    }

    const customers = Object.values(grouped);
    return res.json({ success: true, customers });
  } catch (error) {
    console.error('GET ORDERS ERROR:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message, sqlError: error.sqlMessage || null });
  }
};

// Delete an order by id
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Order id required' });

    await db.query(`DELETE FROM orders WHERE order_id = ?`, [id]);

    return res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('DELETE ORDER ERROR:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete order', error: error.message, sqlError: error.sqlMessage || null });
  }
};

export default {
  createOrder,
  getOrders,
  deleteOrder,
};
