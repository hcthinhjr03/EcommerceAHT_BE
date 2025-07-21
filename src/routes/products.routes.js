import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

// GET /api/v1/products
router.get('/', getAllProducts);

// GET /api/v1/products/:id
router.get('/:id', getProductById);

// POST /api/v1/products
router.post('/', createProduct);

// PATCH /api/v1/products/:id
router.patch('/:id', updateProduct);

// DELETE /api/v1/products/:id
router.delete('/:id', deleteProduct);

export const path = '/products';

export { router };