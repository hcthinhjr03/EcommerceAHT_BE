import { sequelize } from "../config/connection.js";
import { models } from "../models/index.js";
import { Op } from "sequelize";
import { formatDateTime } from "../utils/datetimeHelper.js";

export const getAllOrders = async (req, res) => {
  try {
    const {
      page,
      pageSize,
      status,
      date,
      sortField = "createdAt",
      sortBy = "desc",
    } = req.query;

    const whereClause = {};

    // --- 1. Lọc theo status ---
    if (status) {
      whereClause.status = status;
    }

    // --- 2. Lọc theo date ---
    if (date) {
      const parseDateString = (str) => {
        const [day, month, year] = str.split("/");
        return new Date(`${year}-${month}-${day}`);
      };

      const dateRange = date.split(",").map((d) => d.trim());

      if (dateRange.length === 2) {
        const startDate = parseDateString(dateRange[0]);
        const endDate = parseDateString(dateRange[1]);

        endDate.setHours(23, 59, 59, 999);

        whereClause.createdAt = {
          [Op.between]: [startDate, endDate],
        };
      } else {
        const parsed = parseDateString(dateRange[0]);
        const startDate = new Date(parsed.setHours(0, 0, 0, 0));
        const endDate = new Date(parsed.setHours(23, 59, 59, 999));

        whereClause.createdAt = {
          [Op.between]: [startDate, endDate],
        };
      }
    }

    // --- 3. Sắp xếp ---
    const sortFields = sortField.split(",").map((f) => f.trim());
    const sortOrders = sortBy.split(",").map((o) => o.trim().toUpperCase());

    const orderClause = sortFields
      .map((field, index) => {
        const trimmed = field.trim();
        if (!trimmed) return null; // bỏ field rỗng
        return [trimmed, sortOrders[index] || "DESC"];
      })
      .filter(Boolean);

    // --- 4. Phân trang ---
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    // --- 5. Truy vấn ---
    const orders = await models.Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: models.Customer,
          as: "customer",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: models.OrderProduct,
          as: "orderProducts",
          include: [
            {
              model: models.Product,
              as: "product",
              attributes: ["id", "name", "sku", "thumbnail", "price", "discountPercent"],
            },
          ],
          attributes: ["quantity"],
        },
      ],
      order: orderClause,
      limit,
      offset,
      distinct: true,
    });

    const formattedOrders = orders.rows.map((order) => ({
      ...order.toJSON(),
      createdAt: formatDateTime(order.createdAt),
      updatedAt: formatDateTime(order.updatedAt),
    }));

    return res.status(200).json({
      message: "Orders fetched successfully",
      totalCount: orders.count,
      page: parseInt(page) || 1,
      pageSize: limit,
      data: formattedOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  const id = req.params.id;
  try {
    const order = await models.Order.findByPk(id, {
      include: [
        {
          model: models.Customer,
          as: "customer",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: models.OrderProduct,
          as: "orderProducts",
          include: [
            {
              model: models.Product,
              as: "product",
              attributes: ["id", "name", "sku", "thumbnail", "price", "discountPercent"],
            },
          ],
          attributes: ["quantity"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: `Order with id ${id} not found` });
    }
    const formattedOrder = {
      ...order.toJSON(),
      createdAt: formatDateTime(order.createdAt),
      updatedAt: formatDateTime(order.updatedAt),
    };

    return res.status(200).json({
      message: "Order fetched successfully",
      order: formattedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

export const getOrderByUserId = async (req, res) => {
  const userId = req.params.userId;
  try {
    const {
      page,
      pageSize,
      status,
      date,
      sortField = "createdAt",
      sortBy = "desc",
    } = req.query;

    const whereClause = { customerId: userId };

    // --- 1. Lọc theo status ---
    if (status) {
      whereClause.status = status;
    }

    // --- 2. Lọc theo date ---
    if (date) {
      const parseDateString = (str) => {
        const [day, month, year] = str.split("/");
        return new Date(`${year}-${month}-${day}`);
      };

      const dateRange = date.split(",").map((d) => d.trim());

      if (dateRange.length === 2) {
        const startDate = parseDateString(dateRange[0]);
        const endDate = parseDateString(dateRange[1]);

        endDate.setHours(23, 59, 59, 999);

        whereClause.createdAt = {
          [Op.between]: [startDate, endDate],
        };
      } else {
        const parsed = parseDateString(dateRange[0]);
        const startDate = new Date(parsed.setHours(0, 0, 0, 0));
        const endDate = new Date(parsed.setHours(23, 59, 59, 999));

        whereClause.createdAt = {
          [Op.between]: [startDate, endDate],
        };
      }
    }

    // --- 3. Sắp xếp ---
    const sortFields = sortField.split(",").map((f) => f.trim());
    const sortOrders = sortBy.split(",").map((o) => o.trim().toUpperCase());

    const orderClause = sortFields
      .map((field, index) => {
        const trimmed = field.trim();
        if (!trimmed) return null; // bỏ field rỗng
        return [trimmed, sortOrders[index] || "DESC"];
      })
      .filter(Boolean);

    // --- 4. Phân trang ---
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    // --- 5. Truy vấn ---
    const orders = await models.Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: models.Customer,
          as: "customer",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: models.OrderProduct,
          as: "orderProducts",
          include: [
            {
              model: models.Product,
              as: "product",
              attributes: ["id", "name", "sku", "thumbnail", "price", "discountPercent"],
            },
          ],
          attributes: ["quantity"],
        },
      ],
      order: orderClause,
      limit,
      offset,
      distinct: true,
    });

    if (!orders || orders.count === 0) {
      return res.status(404).json({ message: `No orders found for user ${userId}` });
    }

    const formattedOrders = orders.rows.map((order) => ({
      ...order.toJSON(),
      createdAt: formatDateTime(order.createdAt),
      updatedAt: formatDateTime(order.updatedAt),
    }));

    return res.status(200).json({
      message: "Orders fetched successfully",
      totalCount: orders.count,
      page: parseInt(page) || 1,
      pageSize: limit,
      data: formattedOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
}


export const createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      customerId,
      phone,
      address,
      shippingCost,
      deliveryMethod,
      paymentMethod,
      subTotal,
      grandTotal,
      products,
    } = req.body;

    const newOrder = await models.Order.create(
      {
        customerId,
        phone,
        address,
        shippingCost,
        deliveryMethod,
        paymentMethod,
        subTotal,
        grandTotal,
      },
      { transaction: t }
    );

    const orderProductsResponse = [];

    for (const item of products) {
      const product = await models.Product.findByPk(item.productId, {
        transaction: t,
      });

      if (!product) {
        throw new Error(`Product ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name} (ID: ${product.id})`
        );
      }

      product.stock -= item.quantity;
      await product.save({ transaction: t });

      const orderProduct = await models.OrderProduct.create(
        {
          orderId: newOrder.id,
          productId: product.id,
          sku: product.sku,
          quantity: item.quantity,
          price: product.price,
          discountPercent: product.discountPercent || 0,
        },
        { transaction: t }
      );

      orderProductsResponse.push({
        //id: orderProduct.id,
        //productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: item.quantity,
        discountPercent: product.discountPercent || 0,
        //stockRemaining: product.stock
      });
    }

    await t.commit();

    return res.status(201).json({
      message: "Order created successfully",
      order: {
        id: newOrder.id,
        customerId: newOrder.customerId,
        phone: newOrder.phone,
        address: newOrder.address,
        deliveryMethod: newOrder.deliveryMethod,
        paymentMethod: newOrder.paymentMethod,
        status: newOrder.status,
        shippingCost: newOrder.shippingCost,
        subTotal: newOrder.subTotal,
        grandTotal: newOrder.grandTotal,
        products: orderProductsResponse,
      },
    });
  } catch (err) {
    await t.rollback();
    return res
      .status(500)
      .json({ error: err.message || "Failed to create order" });
  }
};

export const updateOrder = async (req, res) => {
  const id = req.params.id;
  const status = req.body.status;

  try {
    const order = await models.Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: `Order with id ${id} not found` });
    }

    if (status === "cancelled" && order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    }

    if (status === "cancelled" && order.status === "pending") {
      const orderProducts = await models.OrderProduct.findAll({
        where: { orderId: id },
      });

      for (const item of orderProducts) {
        const product = await models.Product.findByPk(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      message: "Order updated successfully",
      order: {
        id: order.id,
        status: order.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update order",
      error: error.message,
    });
  }
};
