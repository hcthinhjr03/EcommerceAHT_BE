import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/connection.js'; 

class Customer extends Model {
    getFullName() {
        return this.fullName;
    }
}

Customer.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 100] // Password must be between 8 and 100 characters
        }
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 100] // Full name must be between 1 and 100 characters
        }
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true // Avatar must be a valid URL
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true,
});

export default Customer;