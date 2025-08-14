import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/connection.js'; 

class Product extends Model {
    static associate(models) {
        if (models.CategoryProduct) {
            Product.hasMany(models.CategoryProduct, { foreignKey: 'productId' });
            Product.belongsToMany(models.Category, {
                through: models.CategoryProduct,
                foreignKey: 'productId',
                otherKey: 'categoryId',
                as: 'categories'
            });
        }
        if (models.OrderProduct) {
            Product.hasMany(models.OrderProduct, { foreignKey: 'productId', as: 'orderProducts' });
            Product.belongsToMany(models.Order, {
                through: models.OrderProduct,
                foreignKey: 'productId',
                otherKey: 'orderId',
                as: 'orders'
            });
        }
        if (models.ProductImage) {
            Product.hasMany(models.ProductImage, { foreignKey: 'productId', as: 'images', onDelete: 'CASCADE' });
        }
    }
}

Product.init({
    id: {  
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 100] // Name must be between 1 and 100 characters
        }
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true // Thumbnail must be a valid URL
        }
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [1, 50] // SKU must be between 1 and 50 characters
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
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isInt: true, // Stock must be an integer
            min: 0 // Stock cannot be negative
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: [0, 1000] // Description can be up to 1000 characters
        }
    },
    isBestSeller: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
});

export default Product;