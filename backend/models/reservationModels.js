// models/reservationModels.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mysql.js";
import { Table } from "./tableModel.js";

export const Reservation = sequelize.define("Reservation", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  guests: { type: DataTypes.INTEGER, allowNull: false },
  tableId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true } // FK
}, { timestamps: true });

// ----- RELATIONSHIPS -----
Reservation.belongsTo(Table, { foreignKey: "tableId", as: "table" });
Table.hasMany(Reservation, { foreignKey: "tableId", as: "reservations" });
