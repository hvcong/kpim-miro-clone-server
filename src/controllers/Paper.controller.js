const { Op } = require('sequelize');

const {
  Paper,
  User,
  Paper_User,
  DrawnObject,
  ChangeLog,
} = require('../configs/persist');
const { PAPER_USER_ROLE } = require('../models/Paper_User.model');

const PaperController = {
  add: async (req, res) => {
    const { userId, isTemplate = false } = req.body;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(405).json({
          isSuccess: false,
          message: 'User not valid',
        });
      }

      const newPaper = await Paper.create({
        isTemplate,
      });

      await newPaper.setUsers(user, {
        through: {
          role: PAPER_USER_ROLE.ADMIN,
        },
      });

      newPaper.save();

      return res.status(200).json({
        isSuccess: true,
        newPaper,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: 'Lỗi hệ thống!',
      });
    }
  },
  getList: async (req, res) => {
    const userId = req.body.userId;

    try {
      const list = await Paper.findAndCountAll({
        include: [
          {
            model: Paper_User,
            where: {
              UserId: userId,
            },
          },
        ],
      });

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
};

module.exports = PaperController;
