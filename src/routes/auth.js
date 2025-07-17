import express from 'express';
import { login, adminLogin, register, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// POST /api/v1/login
router.post('/login', login);

//POST /api/v1/admin/login
router.post('/admin/login', adminLogin); 

//POST /api/v1/register
router.post('/register', register);

//POST /api/v1/forgot-password
router.post('/forgot-password', forgotPassword);

//POST /api/v1/reset-password
router.post('/reset-password', resetPassword); 

export default router;
