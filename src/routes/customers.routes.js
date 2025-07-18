import express from 'express';
import { getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } from '../controllers/customerController.js';

const router = express.Router();

// GET /api/v1/customers
router.get('/', getAllCustomers);

// GET /api/v1/customers/:id
router.get('/:id', getCustomerById);

// PATCH /api/v1/customers/:id
router.patch('/:id', updateCustomer);

// DELETE /api/v1/customers/:id
router.delete('/:id', deleteCustomer);

export const path = '/customers';

export { router };