// models/index.js
import { sequelize } from "../config/sequelize.js";

// Import all models
import { User } from "./user.js";
import { Table } from "./tableModel.js";
import { Reservation } from "./reservationModels.js";
import { Product } from "./productModels.js";
import { Customer } from "./customerModel.js";

// ----------------------------
// DEFINE ASSOCIATIONS HERE
// ----------------------------

// Reservation ↔ Table
Reservation.belongsTo(Table, { foreignKey: "tableId", as: "table" });
Table.hasMany(Reservation, { foreignKey: "tableId", as: "reservations" });

// Export everything cleanly
export {
  sequelize,
  User,
  Table,
  Reservation,
  Product,
  Customer,
};
