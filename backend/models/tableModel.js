// models/tableModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mysql.js";

export const Table = sequelize.define("Table", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  tableNumber: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM("Available", "Reserved"), defaultValue: "Available" }
}, { timestamps: false });

export default Table;