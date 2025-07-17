import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, 
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false, 
    timezone: '+07:00', 
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); 
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

