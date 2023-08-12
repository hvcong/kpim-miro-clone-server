const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');
const { Paper_User } = require('./Paper_User.model');

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

const PaperServices = {
  getList: async (userId) => {
    let list;
    try {
      list = await Paper.findAndCountAll({
        include: [
          {
            model: Paper_User,
            where: {
              UserId: userId,
            },
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }

    return list;
  },
};

module.exports = { Paper, PaperServices };
