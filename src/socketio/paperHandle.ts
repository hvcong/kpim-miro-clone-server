import { Server, Socket } from 'socket.io';
import { PAPER_USER_ROLE, Paper_UserServices } from '../models/Paper_User.model';
import { Paper, PaperServices } from '../models/Paper.model';
import { ChangeLog } from '../models/ChangeLog.model';
import { User } from '../models/User.model';
import { CanvasObject, MousePointer } from '../utils/types';
import sequelize from '../configs/database';
import { DrawnObjServices } from '../models/DrawObject.model';
import { UUIDV4 } from 'sequelize';
import { randomUUID } from 'crypto';

const { DrawnObject } = require('../models/DrawObject.model');

const { Paper_User } = require('../models/Paper_User.model');

const rooms = new Map();

module.exports = async (io: Server, socket: Socket & { paperId: string; userId: string }) => {
  const paperId = socket.paperId;
  const userId = socket.userId;

  // open paper, load paper
  await on_connection();

  //update name
  socket.on('paper:update_name', on_updatePaperName);

  // disconnecting | leave room
  socket.on('disconnecting', on_disconnecting);

  // member mouse moving
  socket.on('member:mouse_moving', on_memberMouseMoving);

  async function on_updatePaperName(name: string) {
    try {
      const paper = await PaperServices.updateName(paperId, name);
      if (!paper) {
        throw new Error('Update name error');
      }
    } catch (error) {
      console.log(error);
    }

    socket.to(paperId).emit('sv:paper:update_name', name);
  }
  async function on_connection() {
    console.log('connection');
    let paper;
    try {
      paper = await Paper.findByPk(paperId, {
        include: [
          {
            model: DrawnObject,
            include: [
              {
                model: ChangeLog,
                include: [{ model: User, attributes: ['id', 'username'] }],
              },
            ],
          },
          { model: Paper_User },
        ],
      });
    } catch (error) {}
    socket.emit('sv:paper:load_all', paper);

    // when user open paper / join room
    socket.join(paperId);
    let room: any[] = rooms.get(paperId);
    if (!room) {
      room = [];
      rooms.set(paperId, room);
    }
    const member = await Paper_UserServices.getMember(userId, paperId);
    room.push(member?.toJSON());
    socket.emit('sv:paper:list_member', Array.from(room));
    socket.to(paperId).emit('sv:member:open_paper', member);
  }
  async function on_disconnecting() {
    const room: any[] = rooms.get(paperId);

    let index = room.findIndex((item) => {
      return item.User.id === userId;
    });

    room.splice(index, 1);

    socket.to(paperId).emit('sv:member:close_paper', userId);
  }
  function on_memberMouseMoving({ pointer }: { pointer: MousePointer }) {
    // socket.to(paperId).emit('sv:member:mouse_moving', {
    //   pointer,
    //   userId,
    // });
  }
};
