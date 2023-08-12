require('dotenv').config();
const { UUIDV4, UUID } = require('sequelize');
const User = require('../models/User.model');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const AuthController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(402).json({
        isSuccess: false,
        message: 'Vui lòng điền đầu đủ thông tin!',
      });
    }
    try {
      let user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        return res.status(402).json({
          isSuccess: false,
          message: 'Email chưa đăng kí tài khoản',
        });
      }

      if (!(await argon2.verify(user.password, password))) {
        return res.status(402).json({
          isSuccess: false,
          message: 'Thông tin tài khoản không chính xác!',
        });
      }

      //oke
      user = user.toJSON();
      delete user.password;

      let token = jwt.sign(
        {
          id: user.id,
        },
        process.env.ACCESS_TOKEN_SECRET,
      );

      return res.status(200).json({
        isSuccess: true,
        user,
        token,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        isSuccess: false,
        message: 'Lỗi hệ thống!',
      });
    }
  },
  register: async (req, res) => {
    const email = req.body?.email;
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(402).json({
        isSuccess: false,
        message: 'Missing email or password',
      });
    }

    let user = await User.findOne({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(402).json({
        isSuccess: false,
        message: 'Email đã có tài khoản',
      });
    }

    //hash password
    let passwordHash = await argon2.hash(password);

    try {
      user = await User.create({
        email,
        password: passwordHash,
      });

      if (!user) {
        return res.status(402).json({
          isSuccess: false,
          message: 'Thông tin không hợp lệ!',
        });
      }

      // oke
      user = user.toJSON();
      delete user.password;

      let token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

      return res.status(200).json({
        isSuccess: true,
        user,
        token,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: 'Lỗi hệ thống!',
      });
    }
  },
  loginByToken: async (req, res) => {
    const { userId } = req.body;

    try {
      let user = await User.findByPk(userId);
      if (!user)
        return res.status(402).json({
          isSuccess: false,
          message: 'Userid not valid',
        });

      //oke
      user = user.toJSON();
      delete user.password;

      let token = jwt.sign(
        {
          id: user.id,
        },
        process.env.ACCESS_TOKEN_SECRET,
      );

      return res.status(200).json({
        isSuccess: true,
        user,
        token,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: 'Lỗi hệ thống!',
      });
    }
  },
};

module.exports = AuthController;
