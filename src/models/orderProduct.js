import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/connection.js';   

class OrderProduct extends Model {
    static associate(models) {
        if (models.Order) {
            OrderProduct.belongsTo(models.Order, { foreignKey: 'orderId' });
        }
        if (models.Product) {
            OrderProduct.belongsTo(models.Product, { foreignKey: 'productId' });
        }
    }
}

OrderProduct.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50] // SKU must be between 1 and 50 characters
        }   
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isInt: true, // Quantity must be an integer
            min: 1 // Quantity must be at least 1
        }
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            isFloat: true, // Price must be a float
            min: 0 // Price cannot be negative
        }
    },
    discountPercent: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
            isFloat: true, // Discount percent must be a float
            min: 0, // Discount percent cannot be negative
            max: 100 // Discount percent cannot exceed 100
        }
    },
}, {
    sequelize,
    modelName: 'OrderProduct',
    tableName: 'order_products',
    timestamps: true,
});

export default OrderProduct;