import express from 'express';
import { getAllOrders, getOrderById, getOrderByUserId, createOrder, updateOrder } from '../controllers/orderController.js';

const router = express.Router();

// GET /api/v1/order
router.get('/', getAllOrders);

// GET /api/v1/order/:id
router.get('/:id', getOrderById);

// GET /api/v1/order/user/:userId
router.get('/user/:userId', getOrderByUserId);

// POST /api/v1/order
router.post('/', createOrder);

// PATCH /api/v1/order/:id
router.patch('/:id', updateOrder);

// DELETE /api/v1/order/:id
//router.delete('/:id', deleteOrder);

export const path = '/order';
export { router };