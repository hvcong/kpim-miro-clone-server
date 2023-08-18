import { Sequelize } from 'sequelize';

const { DataTypes } = require('sequelize');
const sequelize: Sequelize = require('../configs/database');

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM,
      values: ['invite', 'request'],
    },
    role: {
      type: DataTypes.ENUM,
      values: ['edit', 'read', 'comment', 'admin', 'noAccess'],
    },
  },
  {
    timestamps: true,
    deletedAt: true,
  },
);

module.exports = { Message };

export { Message };
