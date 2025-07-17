import dotenv from 'dotenv';
dotenv.config();
import { models } from "../models/index.js";
import nodemailer from 'nodemailer';

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Tìm user theo email
    const user = await models.Customer.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect!" });
    }
    // Nếu mật khẩu không khớp, trả về lỗi
    if (user.password !== password) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect!" });
    }
    res.json({ user, message: "Login successful!" });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Tìm admin theo email
    const admin = await models.AdminUser.findOne({ where: { email } });
    if (!admin) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect!" });
    }
    // Nếu mật khẩu không khớp, trả về lỗi
    if (admin.password !== password) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect!" });
    }
    res.json({ admin, message: "Login successful!" });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const register = async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await models.Customer.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use!" });
    }
    // Tạo mới user
    const newUser = await models.Customer.create({ email, password, fullName });
    res
      .status(201)
      .json({ user: newUser, message: "Registration successful!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed!", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Tìm user theo email
    const user = await models.Customer.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email not found!" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 5 * 60 * 1000; // 5 phút

    // Lưu OTP vào DB
    user.resetOTP = otp;
    user.resetOTPExpire = new Date(otpExpire);
    await user.save();

    // Gửi OTP qua email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Ecommerce AHT" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code to Reset Password",
      html: `
        <p>Hello,</p>
        <p>Your OTP code to reset password is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
      `,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};


export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await models.Customer.findOne({ where: { email } });

    if (!user || !user.resetOTP || !user.resetOTPExpire) {
      return res.status(400).json({ message: 'Invalid request!' });
    }

    // Kiểm tra OTP và thời gian hết hạn
    const now = Date.now();
    if (user.resetOTP !== otp || now > new Date(user.resetOTPExpire).getTime()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    //Cập nhật mật khẩu
    user.password = newPassword;

    // Xoá OTP
    user.resetOTP = null;
    user.resetOTPExpire = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};