import { randomUUID } from 'crypto';
import { DrawnObject } from './DrawObject.model';
import { User } from './User.model';
import { CHANGE_LOG_TYPE, ChangeLog } from './ChangeLog.model';

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');
const { Paper_User, PAPER_USER_ROLE } = require('./Paper_User.model');
const LINK_PERMISSION = {
  CAN_EDIT: 'CAN_EDIT',
  CAN_VIEW: 'CAN_VIEW',
  CAN_COMMENT: 'CAN_COMMENT',
  NO_ACCESS: 'NO_ACCESS',
};

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
    description: {
      type: DataTypes.STRING,
    },
    linkPermission: {
      type: DataTypes.ENUM,
      values: Object.keys(LINK_PERMISSION),
      allowNull: false,
      defaultValue: LINK_PERMISSION.NO_ACCESS,
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
  updateName: async (paperId, newName) => {
    console.log(newName);
    try {
      let paper = await Paper.findByPk(paperId);
      if (!paper) throw new Error('paperId invalid');

      paper.name = newName;

      paper = await paper.save();
      return paper;
    } catch (error) {
      console.log('update papername error:', error);
      return null;
    }
  },

  saveAsTemplate: async (userId, data) => {
    let list = data.list || [];
    const t = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId, {
        transaction: t,
      });
      if (!user) throw new Error('User not found!');

      let paper = await Paper.create(
        {
          isTemplate: true,
          name: data.paperName || 'template',
        },
        {
          transaction: t,
        },
      );
      await paper.addUser(user, {
        through: {
          role: PAPER_USER_ROLE.ADMIN,
        },
        transaction: t,
      });

      for (let i = 0; i < list.length; i++) {
        let canvasObj = list[i];
        let id = randomUUID();
        canvasObj.id = id;
        let newDrawnObj = await DrawnObject.create(
          {
            value: JSON.stringify(canvasObj),
            id,
          },
          {
            transaction: t,
          },
        );

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
      }

      paper = await paper.reload({
        transaction: t,
      });
      await t.commit();
      return paper.toJSON();
    } catch (error) {
      console.log(error);
      t.rollback();
      return null;
    }
  },
};

module.exports = { Paper, PaperServices };

export { Paper, PaperServices, LINK_PERMISSION };
