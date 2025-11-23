import { Sequelize } from "sequelize";
// ...existing code...

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Create Sequelize instance
export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    logging: false,
  }
);

// Test connection
export const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Connected Successfully");
  } catch (err) {
    console.error("❌ MySQL Connection Error:", err);
  }
};
