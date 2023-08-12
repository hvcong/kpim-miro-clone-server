const express = require('express');
const PaperController = require('../controllers/Paper.controller');
const paperRouter = express.Router();

paperRouter.post('/add', PaperController.add);
paperRouter.get('/list', PaperController.getList);
paperRouter.get('/:paperId', PaperController.getOneById);
paperRouter.delete('/:paperId', PaperController.deleteOneById);

module.exports = paperRouter;
