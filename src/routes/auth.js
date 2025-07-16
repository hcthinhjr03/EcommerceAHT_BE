import express from 'express';
import { login, adminLogin, register } from '../controllers/authController.js';

const router = express.Router();

// POST /api/v1/login
router.post('/login', login);

//POST /api/v1/admin/login
router.post('/admin/login', adminLogin); 

//POST /api/v1/register
router.post('/register', register);

export default router;
