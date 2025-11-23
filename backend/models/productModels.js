// models/productModels.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mysql.js";

export const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  image: { type: DataTypes.STRING },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: false });
