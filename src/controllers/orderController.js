import { sequelize } from "../config/connection.js";
import { models } from "../models/index.js";

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
      products
    } = req.body;

    const newOrder = await models.Order.create({
      customerId,
      phone,
      address,
      shippingCost,
      deliveryMethod,
      paymentMethod,
      subTotal,
      grandTotal,
    }, { transaction: t });

    const orderProductsResponse = [];

    for (const item of products) {
      const product = await models.Product.findByPk(item.productId, { transaction: t });

      if (!product) {
        throw new Error(`Product ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name} (ID: ${product.id})`);
      }

      product.stock -= item.quantity;
      await product.save({ transaction: t });

      const orderProduct = await models.OrderProduct.create({
        orderId: newOrder.id,
        productId: product.id,
        sku: product.sku,
        quantity: item.quantity,
        price: product.price,
        discountPercent: product.discountPercent || 0,
      }, { transaction: t });

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
      message: 'Order created successfully',
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
        products: orderProductsResponse
      }
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ error: err.message || 'Failed to create order' });
  }
}

export const updateOrder = async (req, res) => {
    const id = req.params.id;
    const status = req.body.status;

    try {
        const order = await models.Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: `Order with id ${id} not found` });
        }

        if (status === "cancelled" && order.status !== "pending") {
            return res.status(400).json({ message: "Only pending orders can be cancelled" });
        }

        if (status === "cancelled" && order.status === "pending") {
            const orderProducts = await models.OrderProduct.findAll({
                where: { orderId: id }
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
            message: 'Order updated successfully',
            order: {
                id: order.id,
                status: order.status
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update order',
            error: error.message
        });
    }   
}

