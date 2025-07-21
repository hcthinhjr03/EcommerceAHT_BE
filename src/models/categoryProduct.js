import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/connection.js'; 

class CategoryProduct extends Model {
    static associate(models) {
        if (models.Category) {
            CategoryProduct.belongsTo(models.Category, { foreignKey: 'categoryId' });
        }
        if (models.Product) {
            CategoryProduct.belongsTo(models.Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
        }
    }
}

CategoryProduct.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
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
    }
}, {
    sequelize,
    modelName: 'CategoryProduct',
    tableName: 'category_products',
    timestamps: true,
});

export default CategoryProduct;