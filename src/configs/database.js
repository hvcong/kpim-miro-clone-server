const { Sequelize } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize({
  database: 'miro-clone',
  username: 'root',
  password: '',
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
