// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import tableRoutes from './routes/tableRoutes.js';
import { sequelize, connectMySQL } from './config/mysql.js';

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Ensure shared Sequelize instance from config is connected
await connectMySQL();

// Import models and sync
import Table from './models/tableModel.js'; // imports use the shared sequelize
await sequelize.sync({ alter: true }); // sync models defined on shared sequelize

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
