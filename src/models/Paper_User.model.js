const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const PAPER_USER_ROLE = {
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

module.exports = {
  Paper_User,
  PAPER_USER_ROLE,
};
