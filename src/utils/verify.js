require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

async function verifyRequestToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ isSuccess: false, message: 'Token not found' });
  }

  const decoded = await validateToken(token);
  if (!decoded) {
    return res
      .status(402)
      .json({ isSuccess: false, message: 'Token not valid' });
  }

  req.body.userId = decoded.id;
  next();
}

async function validateToken(token) {
  let decoded;
  try {
    decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    decoded = null;
  }

  return decoded;
}

async function verifySocketConnection(socket, next) {
  const token = socket.handshake.auth.token.split(' ')[1];
  const paperId = socket.handshake.auth.paperId;

  let decode = await validateToken(token);

  if (!decode) {
    return next(new Error('Invalid token'));
  }

  socket.userId = decode.id;
  socket.paperId = paperId;
  next();
}

module.exports = {
  verifyRequestToken,
  validateToken,
  verifySocketConnection,
};
