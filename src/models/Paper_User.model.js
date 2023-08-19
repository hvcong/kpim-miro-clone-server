import { Sequelize } from 'sequelize';
import { User } from './User.model';

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

export const PAPER_USER_ROLE = {
  EDIT: 'EDIT',
  READ: 'READ',
  COMMENT: 'COMMENT',
  ADMIN: 'ADMIN',
  NO_ACCESS: 'NOACESS',
};

const Paper_User = sequelize.define('Paper_User', {
  role: {
    type: DataTypes.ENUM,
    values: Object.keys(PAPER_USER_ROLE),
    allowNull: false,
  },
});

const Paper_UserServices = {
  getMember: async (userId, paperId) => {
    let member = await Paper_User.findOne({
      where: {
        PaperId: paperId,
        UserId: userId,
      },
      include: [{ model: User, attributes: ['id', 'username'] }],
    });
    return member;
  },
};

module.exports = {
  Paper_User,
  PAPER_USER_ROLE,
  Paper_UserServices,
};

export { Paper_UserServices, PAPER_USER_ROLE, Paper_User };
