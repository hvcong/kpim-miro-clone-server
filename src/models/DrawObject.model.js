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
  async addOne({ userId, paperId, data }) {
    const t = await sequelize.transaction();
    const id = data.value.id;
    console.log('add one:', id);
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

  async updateOne({ data, drawnObjId, userId, updateType }) {
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
  async removeMany({ drawnObjIdList, userId }, transaction) {
    let user = await User.findByPk(userId, { transaction });
    if (!user) throw new Error('User not found');

    let changeLogList = await ChangeLog.findAll({
      where: {
        DrawnObjectId: drawnObjIdList,
      },
      transaction,
    });

    for (let i = 0; i < changeLogList.length; i++) {
      await changeLogList[i].setUser(user, {
        transaction,
      });

      changeLogList[i].type = CHANGE_LOG_TYPE.DELETE;
      await changeLogList[i].save({
        transaction,
      });
    }

    return true;
  },
  async reAddMany({ drawnObjIdList, userId }, transaction) {
    let user = await User.findByPk(userId, { transaction });
    if (!user) throw new Error('User not found');

    let changeLogList = await ChangeLog.findAll({
      where: {
        DrawnObjectId: drawnObjIdList,
      },
      transaction,
    });

    for (let i = 0; i < changeLogList.length; i++) {
      await changeLogList[i].setUser(user, {
        transaction,
      });

      changeLogList[i].type = CHANGE_LOG_TYPE.ADD;
      await changeLogList[i].save({
        transaction,
      });
    }

    return true;
  },
  async updateMany({ canvasObjList, userId }, transaction) {
    try {
      let user = await User.findByPk(userId, { transaction });
      if (!user) throw new Error('User not found!');

      let drawnList = await DrawnObject.findAll({
        where: {
          id: canvasObjList.map((item) => item.id),
        },
        transaction,
      });

      for (let i = 0; i < drawnList.length; i++) {
        let drawnObj = drawnList[i];

        const changeLog = await drawnObj.getChangeLog({
          transaction,
        });

        if (!changeLog) throw new Error('ChangeLog not exists');

        let canvasObj = canvasObjList.filter((item) => item.id === drawnObj.id)[0];
        if (!canvasObj) throw new Error('Canvas obj not exist in db');

        drawnObj.value = JSON.stringify(canvasObj);

        changeLog.type = CHANGE_LOG_TYPE.UPDATE;
        await changeLog.setUser(user);

        await drawnObj.save({
          transaction,
        });

        await changeLog.save({
          transaction,
        });
      }

      return true;
    } catch (error) {
      console.log(error);
      throw new Error(error.toString());
    }
  },
  async updateOne2({ data, drawnObjId, userId, updateType }, transaction) {
    try {
      const drawnObj = await DrawnObject.findByPk(drawnObjId, {
        transaction,
      });

      if (!drawnObj) throw new Error('DrawnObjId not valid');

      const changeLog = await drawnObj.getChangeLog({
        transaction,
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
        transaction,
      });

      await changeLog.save({
        transaction,
      });

      await drawnObj.reload({
        include: [
          {
            model: ChangeLog,
            include: [{ model: User, attributes: ['id', 'username'] }],
          },
        ],
        transaction,
      });

      await t.commit();
      return drawnObj;
    } catch (error) {
      console.log(error);
      await t.rollback();
      return null;
    }
  },
  async getAllByPaperId(paperId) {
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
  async addOne2({ userId, paperId, data }, transaction) {
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
