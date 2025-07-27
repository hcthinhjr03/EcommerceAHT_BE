import { models } from "../models/index.js";
import { Op } from 'sequelize';

export const getAllProducts = async (req, res) => {
  try {
    // --- 1. Lấy query params ---
    const {
      name,
      category,
      page,
      pageSize,
      sortField = "createdAt",
      sortBy = "desc",
    } = req.query;

    const whereClause = {};

    // --- 2. Tìm kiếm theo name ---
    if (name) {
      whereClause.name = {
        [Op.like]: `%${name}%`,
      };
    }

    // --- 3. Lọc theo category ---
    const categoryList = category
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    // --- 4. Sắp xếp ---
    const sortFields = sortField.split(",").map((f) => f.trim());
    const sortOrders = sortBy.split(",").map((o) => o.trim().toUpperCase());

    const orderClause = sortFields
      .map((field, index) => {
        const trimmed = field.trim();
        if (!trimmed) return null; // bỏ field rỗng
        return [trimmed, sortOrders[index] || "DESC"];
      })
      .filter(Boolean);

    // --- 5. Phân trang ---
    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;

    // --- 6. Truy vấn ---
    const products = await models.Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: models.ProductImage,
          as: "images",
        },
        {
          model: models.Category,
          as: "categories",
          where: categoryList?.length
            ? {
                name: {
                  [Op.in]: categoryList,
                },
              }
            : undefined,
          through: { attributes: [] }, // ẩn bảng trung gian
        },
      ],
      order: orderClause,
      limit,
      offset,
      distinct: true, 
    });

    // --- 7. Trả kết quả ---
    res.status(200).json({
      total: products.count,
      page: parseInt(page),
      pageSize: limit,
      data: products.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await models.Product.findByPk(id, {
      include: [
        {
          model: models.ProductImage,
          as: 'images'
        },
        {
          model: models.Category,
          as: 'categories',
          through: { attributes: [] }
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        message: `Product with id ${id} not found`
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch product detail',
      error: error.message
    });
  }
};

export const createProduct = async (req, res) => {
  const {
    name,
    thumbnail,
    sku,
    price,
    stock,
    discountPercent,
    description,
    images,
    categories,
  } = req.body;

  try {
    // Tạo sản phẩm mới
    const newProduct = await models.Product.create({
      name,
      thumbnail,
      sku,
      price,
      stock,
      discountPercent,
      description,
    });

    // Thêm images nếu có
    if (Array.isArray(images) && images.length > 0) {
      await Promise.all(
        images.map((imageUrl) => {
          models.ProductImage.create({ productId: newProduct.id, imageUrl });
        })
      );
    }

    // Gán category nếu có (giả sử quan hệ N-N qua ProductCategory)
    if (Array.isArray(categories) && categories.length > 0) {
      await Promise.all(
        categories.map((catId) =>
          models.CategoryProduct.create({
            categoryId: catId,
            productId: newProduct.id,
          })
        )
      );
    }

    // Lấy lại sản phẩm kèm images và category
    const productWithDetails = await models.Product.findByPk(newProduct.id, {
      include: [
        { model: models.ProductImage, as: "images" },
        { model: models.Category, as: "categories" },
      ],
    });

    res.status(201).json(productWithDetails);
  } catch (error) {
    res
      .status(500)
      .json({
        message: error.errors?.[0]?.message || "Failed to create product",
        error: error.message
      });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    thumbnail,
    sku,
    price,
    stock,
    discountPercent,
    description,
    images,
    category
  } = req.body;

  try {
    // 1. Tìm sản phẩm
    const product = await models.Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: `Product with id ${id} not found` });
    }

    // 2. Cập nhật thông tin cơ bản
    await product.update({
      name,
      thumbnail,
      sku,
      price,
      stock,
      discountPercent,
      description
    });

    // 3. Cập nhật lại danh sách hình ảnh
    if (Array.isArray(images)) {
      // Xoá ảnh cũ
      await models.ProductImage.destroy({ where: { productId: id } });

      // Thêm ảnh mới
      await Promise.all(
        images.map(imageUrl =>
          models.ProductImage.create({ imageUrl, productId: id })
        )
      );
    }

    // 4. Cập nhật lại danh mục
    if (Array.isArray(category)) {
      // Xoá liên kết danh mục cũ
      await models.CategoryProduct.destroy({ where: { productId: id } });

      // Thêm liên kết mới
      await Promise.all(
        category.map(catId =>
          models.CategoryProduct.create({ productId: id, categoryId: catId })
        )
      );
    }

    // 5. Lấy lại thông tin chi tiết sản phẩm đã cập nhật
    const updatedProduct = await models.Product.findByPk(id, {
      include: [
        { model: models.ProductImage, as: 'images' },
        { model: models.Category, as: 'categories', through: { attributes: [] } }
      ]
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('UPDATE PRODUCT ERROR:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await models.Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: `Product with id ${id} not found` });
    }

    await models.ProductImage.destroy({ where: { productId: id } });
    await models.CategoryProduct.destroy({ where: { productId: id } });
    await product.destroy();

    res.status(200).json({ message: `Product with id ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};
