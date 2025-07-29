import { models } from "../models/index.js";
import { Op } from "sequelize";

const buildCategoryTree = async (parentId, allCategories) => {
  const children = allCategories.filter((cat) => cat.parentId === parentId);

  const result = [];
  for (const cat of children) {
    const subcategories = await buildCategoryTree(cat.id, allCategories);
    result.push({
      ...cat.toJSON(),
      subcategories,
    });
  }

  return result;
};

export const getCategories = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;

  const limit = parseInt(pageSize);
  const offset = (parseInt(page) - 1) * limit;

  try {
    const allCategories = await models.Category.findAll({
      order: [["id", "ASC"]],
    });

    const rootCategories = allCategories.filter((cat) => cat.parentId === null);
    const paginatedRoot = rootCategories.slice(offset, offset + limit);

    const buildCategoryTree = async (category, all) => {
      const children = all.filter((cat) => cat.parentId === category.id);
      const subCategories = await Promise.all(
        children.map((child) => buildCategoryTree(child, all))
      );
      return {
        ...category.toJSON(),
        subCategories,
      };
    };

    const data = await Promise.all(
      paginatedRoot.map((cat) => buildCategoryTree(cat, allCategories))
    );

    res.status(200).json({
      total: rootCategories.length,
      page: parseInt(page),
      pageSize: limit,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await models.Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    const allCategories = await models.Category.findAll({ 
      order: [["id", "ASC"]],
    });
    
    const buildParentBranch = (categoryId, allCats) => {
      const node = allCats.find((cat) => cat.id === categoryId);
      if (!node) return null;
      if (node.parentId === null || node.parentId === undefined) {
        return node.toJSON();
      }
      return {
        ...node.toJSON(),
        parentCategory: buildParentBranch(node.parentId, allCats),
      };
    };
    
    const buildSubCategories = (categoryId, allCats) => {
      const children = allCats.filter((cat) => cat.parentId === categoryId);
      return children.map((child) => ({
        ...child.toJSON(),
        subCategories: buildSubCategories(child.id, allCats)
      }));
    };
    
    const parentBranch = buildParentBranch(category.parentId, allCategories);
    const subCategories = buildSubCategories(category.id, allCategories);
    
    const result = {
      ...category.toJSON(),
      parentCategory: parentBranch,
      subCategories: subCategories
    };
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
  }
};

export const createCategory = async (req, res) => {
  const { name, thumbnail, parentId } = req.body;
  try {
    const newCategory = await models.Category.create({
      parentId,
      name,
      thumbnail,
    });

    if (newCategory.parentId === null || newCategory.parentId === undefined) {
      return res.status(201).json(newCategory);
    }

    const allCategories = await models.Category.findAll({
      order: [["id", "ASC"]],
    });
    const buildParentBranch = (categoryId, allCats) => {
      const node = allCats.find((cat) => cat.id === categoryId);
      if (!node) return null;
      if (node.parentId === null || node.parentId === undefined) {
        return node.toJSON();
      }
      return {
        ...node.toJSON(),
        parentCategory: buildParentBranch(node.parentId, allCats),
      };
    };
    const parentBranch = buildParentBranch(newCategory.parentId, allCategories);
    const result = {
      ...newCategory.toJSON(),
      parentCategory: parentBranch,
    };
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, thumbnail, parentId } = req.body;

  try {
    const category = await models.Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = name;
    category.thumbnail = thumbnail;
    category.parentId = parentId || null;

    await category.save();

    const allCategories = await models.Category.findAll({
      order: [["id", "ASC"]],
    });

    const buildSubCategoryTree = async (currentParentId, allCats) => {
      const children = allCats.filter(
        (cat) => cat.parentId === currentParentId
      );
      if (children.length === 0) {
        return [];
      }

      const subTree = await Promise.all(
        children.map(async (child) => {
          return {
            ...child.toJSON(),
            subCategories: await buildSubCategoryTree(child.id, allCats),
          };
        })
      );

      return subTree;
    };

    const buildParentBranch = (currentChildId, allCats) => {
      const node = allCats.find((cat) => cat.id === currentChildId);
      if (!node || node.parentId === null) {
        return null;
      }

      const parentNode = allCats.find((cat) => cat.id === node.parentId);
      if (!parentNode) {
        return null;
      }

      return {
        ...parentNode.toJSON(),
        parentCategory: buildParentBranch(parentNode.id, allCats),
      };
    };

    const subCategories = await buildSubCategoryTree(
      category.id,
      allCategories
    );
    const parentCategory = buildParentBranch(category.id, allCategories);

    const result = {
      ...category.toJSON(),
      parentCategory: parentCategory,
      subCategories: subCategories,
    };

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  try {
    const associatedProducts = await models.CategoryProduct.count({
      where: { categoryId: categoryId },
    });

    if (associatedProducts > 0) {
      return res.status(400).json({
        message: `Cannot delete category. There are ${associatedProducts} products still associated with it.`,
        error: "FOREIGN_KEY_CONSTRAINT",
      });
    }

    const categoryToDelete = await models.Category.findByPk(categoryId);

    if (!categoryToDelete) {
      return res.status(404).json({ message: "Category not found" });
    }

    const allCategories = await models.Category.findAll();

    // Hàm đệ quy để tìm tất cả ID của các danh mục con
    const findAllSubCategoryIds = (parentId, allCats) => {
      const subCategoryIds = [];
      const children = allCats.filter((cat) => cat.parentId === parentId);

      for (const child of children) {
        subCategoryIds.push(child.id);
        subCategoryIds.push(...findAllSubCategoryIds(child.id, allCats));
      }
      return subCategoryIds;
    };

    const idsToDelete = [
      categoryId,
      ...findAllSubCategoryIds(categoryId, allCategories),
    ];

    // Kiểm tra xem có sản phẩm nào thuộc về các danh mục con không
    const productsInSubCategories = await models.CategoryProduct.count({
      where: {
        categoryId: {
          [Op.in]: idsToDelete.filter((subId) => subId !== categoryId),
        },
      },
    });

    if (productsInSubCategories > 0) {
      return res.status(400).json({
        message: `Cannot delete category. There are products in its subcategories. Please reassign them first.`,
        error: "FOREIGN_KEY_CONSTRAINT_IN_SUBCATEGORY",
      });
    }

    await models.Category.destroy({
      where: {
        id: {
          [Op.in]: idsToDelete,
        },
      },
    });

    res
      .status(200)
      .json({ message: `Successfully deleted category and its subcategories` });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting category",
      error: error.message,
    });
  }
};
