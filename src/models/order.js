import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/connection.js'; 

class Order extends Model {
    static associate(models) {
        if (models.Customer) {
            Order.belongsTo(models.Customer, { foreignKey: 'customerId' });
        }
        if (models.OrderProduct) {
            Order.hasMany(models.OrderProduct, { foreignKey: 'orderId' });
            Order.belongsToMany(models.Product, {
                through: models.OrderProduct,
                foreignKey: 'orderId',
                otherKey: 'productId',
                as: 'products'
            });
        }
    }
}

Order.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'customers',
            key: 'id'
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shippingCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    deliveryMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'standard'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'credit_card'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
    },
    subTotal: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    grandTotal: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
});

export default Order;