import { models } from "../models/index.js";

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await models.Customer.findAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve customers", error: error.message });
  }
}

export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await models.Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve customer", error: error.message });
  }
}


export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { email, fullName, phone, address, avatar } = req.body;
  try {
    const customer = await models.Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    customer.email = email || customer.email;
    customer.fullName = fullName || customer.fullName;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    customer.avatar = avatar || customer.avatar;
    await customer.save();
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Failed to update customer", error: error.message });
  }
}

export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await models.Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    await customer.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete customer", error: error.message });
  }
}