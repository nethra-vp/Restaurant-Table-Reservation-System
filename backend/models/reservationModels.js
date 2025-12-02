// models/reservationModels.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mysql.js";
import { Table } from "./tableModel.js";
import { Customer } from "./customerModel.js";

export const Reservation = sequelize.define("Reservation", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, field: 'reservation_id' },
  customerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'customer_id' },
  tableId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'table_id' },
  date: { type: DataTypes.DATEONLY, allowNull: false, field: 'reservation_date' },
  time: { type: DataTypes.TIME, allowNull: false, field: 'reservation_time' },
  guests: { type: DataTypes.INTEGER, allowNull: false }
  ,
  cancellationToken: { type: DataTypes.STRING, allowNull: true, field: 'cancellation_token' },
  cancellationTokenExpiry: { type: DataTypes.DATE, allowNull: true, field: 'cancellation_token_expiry' }
}, { tableName: 'reservations', timestamps: false });

// ----- RELATIONSHIPS -----
Reservation.belongsTo(Table, { foreignKey: "tableId", as: "table" });
Table.hasMany(Reservation, { foreignKey: "tableId", as: "reservations" });
// link reservation → customer
Reservation.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
Customer.hasMany(Reservation, { foreignKey: "customerId", as: "customerReservations" });
