const { STRING, DataTypes } = require('sequelize');
const sequelize = require('../configs/database');
const CHANGE_LOG_TYPE = {
  ADD: 'ADD',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

const ChangeLog = sequelize.define(
  'ChangeLog',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1,
    },
    type: {
      type: DataTypes.ENUM,
      values: Object.keys(CHANGE_LOG_TYPE),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.keys(CHANGE_LOG_TYPE)],
          msg: 'ChangeLog type not valid',
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = { ChangeLog, CHANGE_LOG_TYPE };
