// models/tableModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mysql.js";

export const Table = sequelize.define("Table", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, field: 'table_id' },
  tableNumber: { type: DataTypes.INTEGER, allowNull: false, field: 'table_number' },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM("Available", "Reserved"), defaultValue: "Available" }
}, {
  tableName: 'restaurant_tables',
  timestamps: false,
  // define an explicit, named unique index for the table_number column
  indexes: [
    { name: 'ux_restaurant_tables_table_number', unique: true, fields: ['table_number'] }
  ]
});

export default Table;