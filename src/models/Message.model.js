import { Sequelize } from 'sequelize';

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const LINK_PERMISSION = {
  CAN_EDIT: 'CAN_EDIT',
  CAN_VIEW: 'CAN_VIEW',
  CAN_COMMENT: 'CAN_COMMENT',
  NO_ACCESS: 'NO_ACCESS',
};

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM,
      values: ['INVITE', 'REQUEST'],
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: Object.keys(LINK_PERMISSION),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    deletedAt: true,
  },
);

module.exports = { Message };

export { Message };
