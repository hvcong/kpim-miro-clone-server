const express = require('express');
const AuthController = require('../controllers/Auth.controller');
const { verifyRequestToken } = require('../utils/verify');
const authRouter = express.Router();

authRouter.post('/login', AuthController.login);
authRouter.post('/register', AuthController.register);
authRouter.get(
  '/loginByToken',
  verifyRequestToken,
  AuthController.loginByToken,
);

module.exports = authRouter;
