// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import tableRoutes from './routes/tableRoutes.js';

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Initialize Sequelize
const sequelize = new Sequelize('restaurant_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

// Test database connection
try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

// Import models and sync
import Table from './models/tableModel.js'; // ensure this path is correct
// Table.initModel(sequelize); // if your model uses a custom init function
await sequelize.sync({ alter: true }); // or { force: true } to reset tables

// Seed tables if none exist
const tableCount = await Table.count();
if (tableCount === 0) {
  await Table.bulkCreate([
    { tableNumber: 1, capacity: 2, status: 'Available' },
    { tableNumber: 2, capacity: 4, status: 'Available' },
    { tableNumber: 3, capacity: 6, status: 'Available' },
    { tableNumber: 4, capacity: 8, status: 'Available' },
  ]);
  console.log('Seeded sample tables to database.');
}

// Routes
app.use('/api/table', tableRoutes);
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import reservationRouter from './routes/reservationRoute.js';
import customerRoutes from './routes/customerRoutes.js';
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/customer', customerRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default sequelize;
