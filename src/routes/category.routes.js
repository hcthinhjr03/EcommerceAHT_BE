import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory, getCategoryById } from '../controllers/categoryController.js';

const router = express.Router();

// GET /api/v1/category
router.get('/', getCategories);

//GET /api/v1/category/:id
router.get('/:id', getCategoryById);

// POST /api/v1/category
router.post('/', createCategory);

// PATCH /api/v1/category/:id
router.patch('/:id', updateCategory);

// DELETE /api/v1/category/:id
router.delete('/:id', deleteCategory);

export const path = '/category';
export { router };

