const { DrawnObject } = require('../models/DrawObject.model');
const Paper = require('../models/Paper.model');
const { Paper_User } = require('../models/Paper_User.model');

module.exports = async (io, socket) => {
  const paperId = socket.paperId;
  const userId = socket.userId;
  console.log('connection');
  let paper;
  try {
    paper = await Paper.findByPk(paperId, {
      include: [{ model: DrawnObject }, { model: Paper_User }],
    });
  } catch (error) {}

  socket.emit('paper_data', { paper });
};
