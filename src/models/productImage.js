import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/connection.js'; 

class ProductImage extends Model {
    static associate(models) {
        if (models.Product) {
            ProductImage.belongsTo(models.Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
        }
    }
}

ProductImage.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true // Image URL must be valid
        }
    }
}, {
    sequelize,
    modelName: 'ProductImage',
    tableName: 'product_images',
    timestamps: true,
});

export default ProductImage;