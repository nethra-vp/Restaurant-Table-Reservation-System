// models/customerModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mysql.js";
import db from "../config/db.js";

export const Customer = sequelize.define("Customer", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, field: 'customer_id' },
  name: { type: DataTypes.STRING, allowNull: false, field: 'customer_name' },
  email: { type: DataTypes.STRING, allowNull: false, field: 'customer_email' },
  phone: { type: DataTypes.STRING, allowNull: false, field: 'customer_phone' }
}, { tableName: 'customers', timestamps: false });

export default Customer;