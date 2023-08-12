const { DrawnObjServices } = require('../models/DrawObject.model');

const DrawnObjectController = {
  addOne: async (req, res) => {
    try {
      const drawnObj = await DrawnObjServices.addOne({
        userId: req.body.userId,
        paperId: req.params.paperId,
        data: req.body,
      });

      if (!drawnObj)
        return res.status(402).json({
          isSuccess: false,
          message: 'Thao tác thất bại!',
        });

      return res.status(200).json({
        isSuccess: true,
        drawnObj,
      });
    } catch (err) {
      return res.status(500).json({
        isSuccess: false,
        message: 'Lỗi hệ thống!',
      });
    }
  },
  updateOne: async (req, res) => {
    try {
      const { userId, updateType, ...data } = req.body;
      const drawnObj = await DrawnObjServices.updateOne({
        data: data,
        userId,
        updateType,
        drawnObjId: req.params.drawnObjId,
      });

      if (!drawnObj)
        return res.status(402).json({
          isSuccess: false,
          message: 'Thao tác thất bại!',
        });

      return res.status(200).json({
        isSuccess: true,
        drawnObj,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: 'Lỗi hệ thống!',
      });
    }
  },
  getAllByPaperId: async (req, res) => {
    try {
      const drawnObjList = await DrawnObjServices.getAllByPaperId(
        req.params.paperId,
      );
      if (!drawnObjList) {
        return res.status(403).json({
          isSuccess: false,
          message: 'Thao tác không thành công!',
        });
      }
      return res.status(200).json({
        isSuccess: true,
        drawnObjList,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: 'Lỗi hệ thống!',
      });
    }
  },
};

module.exports = DrawnObjectController;
