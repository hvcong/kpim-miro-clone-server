import { randomUUID } from 'crypto';
import { User } from './User.model';
import { DrawnObject } from './DrawObject.model';
import { CHANGE_LOG_TYPE, ChangeLog } from './ChangeLog.model';

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Template = sequelize.define(
  'Template',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    description: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: 'template_name',
    },
    shareState: {
      type: DataTypes.STRING,
      defaultValue: 'private',
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'default',
    },
  },
  { timestamps: true },
);

const TemplateServices = {
  getListByUserId: async (userId) => {
    const list = await Template.findAll({
      where: {
        UserId: userId,
      },
      include: [
        {
          model: User,
          attributes: {
            exclude: ['password'],
          },
        },
      ],
    });

    return list;
  },

  createTemplate: async (userId, data) => {
    const { list = [], name = 'template_name', description = '' } = data;

    const t = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId, {
        transaction: t,
      });
      if (!user) throw new Error('User not found!');

      let template = await Template.create(
        {
          name,
          description,
        },
        {
          transaction: t,
        },
      );

      await template.setUser(user, {
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

        await newDrawnObj.setTemplate(template, {
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

      template = await template.reload({
        include: [
          {
            model: User,
            attributes: {
              exclude: ['password'],
            },
          },
        ],
        transaction: t,
      });
      await t.commit();
      return template.toJSON();
    } catch (error) {
      t.rollback();
      throw new Error(error.toString());
    }
  },
  getById: async (id) => {
    let tmp = await Template.findByPk(id, {
      include: [
        {
          model: User,
          attributes: {
            exclude: ['password'],
          },
        },
        {
          model: DrawnObject,
        },
      ],
    });
    return tmp;
  },
};

module.exports = { Template, TemplateServices };

export { Template, TemplateServices };
