import dotenv from 'dotenv';
dotenv.config();
//import authRoutes from './routes/auth.routes.js';
//import customerRoutes from './routes/customers.routes.js';
import express from 'express';
import cors from 'cors';
import { models } from './models/index.js';
import { connectDB } from './config/connection.js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

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

// Import and use routes dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesPath = path.join(__dirname, 'routes');

const files = fs.readdirSync(routesPath);

for (const file of files) {
  const fullPath = path.join(routesPath, file);
  const moduleUrl = pathToFileURL(fullPath).href;
  const { path: routePath, router } = await import(moduleUrl);
  if (routePath && router) {
    app.use(`/api/v1${routePath}`, router);
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

