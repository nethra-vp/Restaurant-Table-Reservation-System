// models/user.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mysql.js";

export const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, field: 'user_id' },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'user_email' },
  password: { type: DataTypes.STRING, allowNull: false, field: 'user_password' },
  role: { type: DataTypes.STRING, field: 'user_role', defaultValue: "admin" }
}, { tableName: 'users', timestamps: false });
