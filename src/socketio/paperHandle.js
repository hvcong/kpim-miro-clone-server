const { DrawnObject } = require('../models/DrawObject.model');
const { Paper } = require('../models/Paper.model');
const { Paper_User } = require('../models/Paper_User.model');

const rooms = new Map();
const paperRooms = [];

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

  // when user open paper / join room
  socket.join(paperId);
  let room = rooms.get(paperId);
  if (!room) {
    room = new Set();
    rooms.set(paperId, room);
  }
  room.add(userId);

  socket.to(paperId).emit('sv:member:open_paper', userId);
  socket.emit('sv:paper:list_member', Array.from(room));

  //update name
  socket.on('paper:update_name', async (name) => {
    try {
    } catch (error) {}
    socket.to(paperId).emit('sv:paper:update_name', name);
  });

  // disconnecting | leave room
  socket.on('disconnecting', () => {
    let room = rooms.get(paperId);
    room.delete(userId);
    socket.to(paperId).emit('sv:member:close_paper', userId);
  });
};
