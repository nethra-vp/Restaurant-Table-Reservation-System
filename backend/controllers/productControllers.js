import express from 'express';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productControllers.js';

const productRouter = express.Router();

// CREATE
productRouter.post('/add', upload.single("image"), adminAuth, addProduct);

// READ ALL
productRouter.get('/list', getProducts);

// READ ONE
productRouter.get('/single/:id', getProductById);

// UPDATE
productRouter.put('/update/:id', upload.single("image"), adminAuth, updateProduct);

// DELETE
productRouter.delete('/remove/:id', adminAuth, deleteProduct);

export default productRouter;
