const { Op } = require('sequelize');

const { PAPER_USER_ROLE, Paper_User } = require('../models/Paper_User.model');
const { PaperServices, Paper } = require('../models/Paper.model');
const { User } = require('../models/User.model');
const { DrawnObject, DrawnObjServices } = require('../models/DrawObject.model');
const sequelize = require('../configs/database');
const { randomUUID } = require('crypto');

const PaperController = {
  add: async (req, res) => {
    const { userId, templateId } = req.body;

    const t = await sequelize.transaction();
    console.log(templateId);

    try {
      const user = await User.findByPk(userId, { transaction: t });
      if (!user) {
        t.rollback();
        return res.status(405).json({
          isSuccess: false,
          message: 'User not valid',
        });
      }

      const newPaper = await Paper.create(
        {},
        {
          transaction: t,
        },
      );

      await newPaper.setUsers(user, {
        through: {
          role: PAPER_USER_ROLE.ADMIN,
        },
        transaction: t,
      });

      await newPaper.save({
        transaction: t,
      });

      if (templateId) {
        let drawnObjList = await DrawnObject.findAll({
          where: {
            TemplateId: templateId,
          },
          attributes: ['value'],
          transaction: t,
        });

        if (drawnObjList) {
          for (let i = 0; i < drawnObjList.length; i++) {
            let item = drawnObjList[i].toJSON();
            let canvasObj = JSON.parse(item.value);
            canvasObj.id = randomUUID();

            let obj = await DrawnObjServices.addOne2(
              {
                userId,
                paperId: newPaper.id,
                data: {
                  value: canvasObj,
                },
              },
              t,
            );
          }
        }
      }

      t.commit();

      return res.status(200).json({
        isSuccess: true,
        newPaper,
      });
    } catch (error) {
      t.rollback();
      return res.status(500).json({
        isSuccess: false,
        message: 'Lỗi hệ thống!',
      });
    }
  },
  getList: async (req, res) => {
    const userId = req.body.userId;

    try {
      const list = await PaperServices.getList(userId);

      return res.status(200).json({
        isSuccess: true,
        paperList: list.rows,
        count: list.count,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        isSuccess: false,
        message: 'Lỗi hệ thống!',
      });
    }
  },
  getOneById: async (req, res) => {
    const userId = req.body.userId;
    const { paperId } = req.params;
    try {
      if (!paperId) throw new Error('PaperId not valid!');

      const paper = await Paper.findByPk(paperId, {
        include: [
          {
            model: DrawnObject,
          },
        ],
      });
      if (!paper) throw new Error('paper not found');

      return res.status(200).json({
        isSuccess: true,
        paper,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: error?.toString(),
      });
    }
  },
  deleteOneById: async (req, res) => {
    const { userId } = req.body;
    const { paperId } = req.params;

    try {
      if (!userId || !paperId) throw new Error('userId or paperId not valid!');

      let paper = await Paper.findOne({
        where: {},
        include: [
          {
            model: Paper_User,
            where: {
              [Op.and]: [
                {
                  role: 'admin',
                  UserId: userId,
                },
              ],
            },
          },
        ],
      });

      if (!paper) throw new Error('Not have permistion for delete');

      await paper.destroy();
      return res.status(200).json({
        isSuccess: true,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: error?.toString(),
      });
    }
  },
  saveAsTemplate: async (req, res) => {
    const { userId, ...data } = req.body;

    try {
      const template = await PaperServices.saveAsTemplate(userId, data);
      if (!template) throw new Error('Save as template error');

      return res.status(200).json({
        isSuccess: true,
        template,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        isSuccess: false,
        message: 'Save as template error',
      });
    }
  },
};

module.exports = PaperController;
