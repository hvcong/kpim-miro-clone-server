const express = require('express');
const DrawnObjectController = require('../controllers/DrawnObjects.controller');
const drawObjectRouter = express.Router();

drawObjectRouter.post('/:paperId/add', DrawnObjectController.addOne);
drawObjectRouter.put('/:drawnObjId', DrawnObjectController.updateOne);
drawObjectRouter.get('/:paperId/all', DrawnObjectController.getAllByPaperId);

module.exports = drawObjectRouter;
