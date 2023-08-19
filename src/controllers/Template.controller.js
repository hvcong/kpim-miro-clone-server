const { PaperServices } = require('../models/Paper.model');
const { TemplateServices } = require('../models/Template.model');

const TemplateController = {
  add: async (req, res) => {
    const { userId, ...data } = req.body;
    try {
      data.list = JSON.parse(data.list);

      const template = await TemplateServices.createTemplate(userId, data);
      if (!template) throw new Error('Create template error');
      return res.status(200).json({
        template,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: error,
      });
    }
  },
  getAllByUserId: async (req, res) => {
    const { userId } = req.body;

    try {
      let list = await TemplateServices.getListByUserId(userId);

      return res.status(200).json({
        isSuccess: true,
        list,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: error,
      });
    }
  },
  async getById(req, res) {
    const tmpId = req.params.templateId;

    try {
      const tmp = await TemplateServices.getById(tmpId);

      if (!tmp) throw new Error('Template not found');
      return res.status(200).json({
        isSuccess: true,
        template: tmp,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: error.toString(),
      });
    }
  },
};

module.exports = TemplateController;
