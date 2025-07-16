import { models } from '../models/index.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Tìm user theo email
    const user = await models.Customer.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }
    // Nếu mật khẩu không khớp, trả về lỗi
    if (user.password !== password) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }
    res.json({ user, message: 'Đăng nhập thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Đăng nhập thất bại', error: error.message });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Tìm admin theo email
    const admin = await models.AdminUser.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }
    // Nếu mật khẩu không khớp, trả về lỗi
    if (admin.password !== password) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }
    res.json({ admin, message: 'Đăng nhập thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Đăng nhập thất bại', error: error.message });
  }
};


export const register = async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await models.Customer.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng!' });
    }
    // Tạo mới user
    const newUser = await models.Customer.create({ email, password, fullName });
    res.status(201).json({ user: newUser, message: 'Đăng ký thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Đăng ký thất bại', error: error.message });
  }
}

