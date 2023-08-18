import { DataTypes, Sequelize } from 'sequelize';
const sequelize = require('../configs/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      defaultValue: 'User Name Default',
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

const UserServices = {};

module.exports = { User, UserServices };

export { User, UserServices };
