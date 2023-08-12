const { DrawnObjServices } = require('../models/DrawObject.model');

module.exports = (io, socket) => {
  const paperId = socket.paperId;
  const userId = socket.userId;

  socket.on('drawn_obj:add', addObj);

  async function addObj(data) {
    try {
      const res = await DrawnObjServices.addOne({
        userId,
        paperId,
        data,
      });

      socket.to(paperId).emit('sv:drawn_obj:add', data);
    } catch (err) {}
  }
};
