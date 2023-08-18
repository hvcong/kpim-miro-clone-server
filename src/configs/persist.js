const sequelize = require('./database');
const { DrawnObject } = require('../models/DrawObject.model');
const { Message } = require('../models/Message.model');
const { Paper } = require('../models/Paper.model');
const { Paper_User } = require('../models/Paper_User.model');
const { User } = require('../models/User.model');
const { ChangeLog } = require('../models/ChangeLog.model');
const { Template } = require('../models/Template.model');

User.belongsToMany(Paper, { through: Paper_User });
Paper.belongsToMany(User, { through: Paper_User });

Paper_User.belongsTo(Paper);
Paper_User.belongsTo(User);

Paper.hasMany(Paper_User);
User.hasMany(Paper_User);

Paper.hasMany(DrawnObject);
DrawnObject.belongsTo(Paper);

DrawnObject.hasOne(ChangeLog);
ChangeLog.belongsTo(DrawnObject);

User.hasMany(ChangeLog);
ChangeLog.belongsTo(User);

User.hasMany(Message);
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiveId', as: 'receiver' });

Template.hasMany(DrawnObject);
DrawnObject.belongsTo(Template);

Template.belongsTo(User);
User.hasMany(Template);

sequelize
  .sync({
    // force: true,
  })
  .then((result) => {
    console.log('connect db oke');
  })
  .catch((error) => console.log('sync error'));
