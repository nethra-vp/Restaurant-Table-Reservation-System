// models/productModels.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mysql.js";

export const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, field: 'product_id' },
  name: { type: DataTypes.STRING, allowNull: false, field: 'product_name' },
  description: { type: DataTypes.TEXT, field: 'product_description' },
  category: { type: DataTypes.STRING, field: 'product_category' },
  price: { type: DataTypes.DECIMAL(10,2), defaultValue: 1, field: 'product_price' },
  image: { type: DataTypes.STRING, field: 'product_image' },
  createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW }
}, { tableName: 'products', timestamps: false });
