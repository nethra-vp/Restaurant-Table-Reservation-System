import { sequelize } from "./mysql.js";

// Import all models once → they auto-register with Sequelize
import "../models/customerModel.js";
import "../models/productModels.js";
import "../models/reservationModels.js";
import "../models/tableModel.js";
import "../models/user.js";

export const syncMySQL = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("📌 All MySQL models synced successfully");
  } catch (err) {
    console.error("❌ Sequelize sync error:", err);
  }
};
