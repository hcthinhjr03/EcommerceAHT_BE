import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/connection.js'; 

class Category extends Model {
    static associate(models) {
        if (models.CategoryProduct) {
            Category.hasMany(models.CategoryProduct, { foreignKey: 'categoryId' });
            Category.belongsToMany(models.Product, {
                through: models.CategoryProduct,
                foreignKey: 'categoryId',
                otherKey: 'productId',
                as: 'products'
            });
        }
        if (models.Category) {
            Category.hasMany(models.Category, { foreignKey: 'parentId', as: 'subcategories' });
            Category.belongsTo(models.Category, { foreignKey: 'parentId', as: 'parentCategory' });
        }
    }
}

Category.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
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
}, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
});

export default Category;