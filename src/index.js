import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/auth.js';
import express from 'express';
import cors from 'cors';
import { models } from './models/index.js';
import { connectDB } from './config/connection.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();


// Middleware to parse JSON requests
app.use(express.json());
// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));
// Middleware to handle CORS
app.use(cors());
// Middleware to serve static files
app.use(express.static('public'));


// Đăng ký route cho API login
app.use('/api/v1', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

