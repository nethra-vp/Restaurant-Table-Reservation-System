// models/customerModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mysql.js";
import db from "../config/db.js";

export const Customer = sequelize.define("Customer", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

export default Customer;