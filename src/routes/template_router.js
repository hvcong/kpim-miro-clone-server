const express = require('express');
const TemplateController = require('../controllers/Template.controller');
const templateRouter = express.Router();

templateRouter.post('/add', TemplateController.add);
templateRouter.get('/list', TemplateController.getAllByUserId);
templateRouter.get('/:templateId', TemplateController.getById);

module.exports = templateRouter;
