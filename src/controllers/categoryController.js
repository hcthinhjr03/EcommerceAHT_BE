import { models } from "../models/index.js";

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
      const subcategories = await Promise.all(
        children.map((child) => buildCategoryTree(child, all))
      );
      return {
        ...category.toJSON(),
        subcategories,
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

export const createCategory = async (req, res) => {
  const { name, thumbnail, parentId } = req.body;
  try {
    const newCategory = await models.Category.create({
      parentId,
      name,
      thumbnail,
    });

    // Nếu là category cha (parentId=null), trả về node vừa tạo
    if (newCategory.parentId === null || newCategory.parentId === undefined) {
      return res.status(201).json(newCategory);
    }

    // Nếu là category con, trả về cây cha lồng các cấp cha
    const allCategories = await models.Category.findAll({
      order: [["id", "ASC"]],
    });
    // Hàm dựng branch cha lồng nhau
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
    // Trả về node vừa tạo, include parent branch
    const result = {
      ...newCategory.toJSON(),
      parentCategory: parentBranch,
    };
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error });
  }
};


