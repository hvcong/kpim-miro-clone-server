const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Paper = sequelize.define(
  'Paper',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: 'default',
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    value: {
      type: DataTypes.TEXT,
    },
  },
  { timestamps: true },
);

module.exports = Paper;
