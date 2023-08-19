import { Sequelize } from 'sequelize';
import { CanvasObject } from '../utils/types';

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');
const { ChangeLog, CHANGE_LOG_TYPE } = require('./ChangeLog.model');
const { Paper } = require('./Paper.model');
const { User } = require('./User.model');

const DrawnObject = sequelize.define(
  'DrawnObject',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    timestamps: false,
  },
);

const DrawnObjServices = {
  addOne: async ({ userId, paperId, data }) => {
    const t = await sequelize.transaction();
    const id = data.value.id;
    console.log(id);
    data.value.fromEmit = false;
    const value = JSON.stringify(data.value);
    try {
      const newDrawnObj = await DrawnObject.create(
        {
          value,
          id,
        },
        {
          transaction: t,
        },
      );
      const user = await User.findByPk(userId, {
        transaction: t,
      });
      if (!user) throw new Error('UserId id not valid');

      const paper = await Paper.findByPk(paperId, { transaction: t });
      if (!paper) throw new Error('PaperId id not valid');
      await newDrawnObj.setPaper(paper, {
        transaction: t,
      });

      const log = await ChangeLog.create(
        {
          type: CHANGE_LOG_TYPE.ADD,
        },
        {
          transaction: t,
        },
      );

      await log.setUser(user, {
        transaction: t,
      });

      await newDrawnObj.setChangeLog(log, {
        transaction: t,
      });

      await newDrawnObj.reload({
        include: [
          {
            model: ChangeLog,
            include: [
              {
                model: User,
                attributes: ['id', 'username'],
              },
            ],
          },
        ],
        transaction: t,
      });
      await t.commit();
      return newDrawnObj.toJSON();
    } catch (err) {
      console.log('add drawnObj err', err);
      await t.rollback();
      return null;
    }
  },

  updateOne: async ({ data, drawnObjId, userId, updateType }) => {
    const t = await sequelize.transaction();

    try {
      const drawnObj = await DrawnObject.findByPk(drawnObjId, {
        transaction: t,
      });

      if (!drawnObj) throw new Error('DrawnObjId not valid');

      const changeLog = await drawnObj.getChangeLog({
        transaction: t,
      });

      const user = await User.findByPk(userId);
      if (!user) throw new Error('Userid not valid');

      if (!changeLog) throw new Error('ChangeLog not exists');

      if (data) {
        drawnObj.value = JSON.stringify(data.value);
      }
      changeLog.type = updateType?.toUpperCase();
      await changeLog.setUser(user);

      await drawnObj.save({
        transaction: t,
      });

      await changeLog.save({
        transaction: t,
      });

      await drawnObj.reload({
        include: [
          {
            model: ChangeLog,
            include: [{ model: User, attributes: ['id', 'username'] }],
          },
        ],
        transaction: t,
      });

      await t.commit();
      return drawnObj;
    } catch (error) {
      console.log(error);
      await t.rollback();
      return null;
    }
  },
  getAllByPaperId: async (paperId) => {
    try {
      let list = await DrawnObject.findAll({
        where: {
          paperId,
        },
        include: [
          {
            model: ChangeLog,
            include: [{ model: User, attributes: ['id', 'username'] }],
          },
        ],
      });
      return list;
    } catch (error) {
      return null;
    }
  },
  addOne2: async ({ userId, paperId, data }, transaction) => {
    const id = data.value.id;

    data.value.fromEmit = false;
    const value = JSON.stringify(data.value);
    try {
      const newDrawnObj = await DrawnObject.create(
        {
          value,
          id,
        },
        {
          transaction,
        },
      );
      const user = await User.findByPk(userId, {
        transaction,
      });
      if (!user) throw new Error('UserId id not valid');

      const paper = await Paper.findByPk(paperId, { transaction });
      if (!paper) throw new Error('PaperId id not valid');
      await newDrawnObj.setPaper(paper, {
        transaction,
      });

      const log = await ChangeLog.create(
        {
          type: CHANGE_LOG_TYPE.ADD,
        },
        {
          transaction,
        },
      );

      await log.setUser(user, {
        transaction,
      });

      await newDrawnObj.setChangeLog(log, {
        transaction,
      });

      await newDrawnObj.reload({
        include: [
          {
            model: ChangeLog,
            include: [
              {
                model: User,
                attributes: ['id', 'username'],
              },
            ],
          },
        ],
        transaction,
      });
      return newDrawnObj.toJSON();
    } catch (err) {
      console.log('add drawnObj err', err);
      t.rollback();
      throw err;
    }
  },
};

module.exports = { DrawnObject, DrawnObjServices };
export { DrawnObject, DrawnObjServices };
