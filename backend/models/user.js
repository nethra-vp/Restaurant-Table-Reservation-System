// models/user.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mysql.js";

export const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: "admin" }
}, { timestamps: true });
