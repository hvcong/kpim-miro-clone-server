import { Server, Socket } from 'socket.io';
import { DrawnObjServices, DrawnObject } from '../models/DrawObject.model';
import { CHANGE_LOG_TYPE, ChangeLog } from '../models/ChangeLog.model';
import sequelize from '../configs/database';
import { User } from '../models/User.model';

module.exports = (io: Server, socket: Socket & { paperId: string; userId: string }) => {
  const paperId = socket.paperId;
  const userId = socket.userId;

  socket.on('drawn_obj:add', addObj);
  socket.on('drawn_obj:re_add_many', reAddMany);
  socket.on('drawn_obj:remove_one', removeObj);
  socket.on('drawn_obj:update_one', updateObj);
  socket.on('drawn_obj:remove_many', removeMany);
  socket.on('drawn_obj:update_many', updateMany);

  async function addObj(data: { value: { id: string } }, callback: (obj: any) => void) {
    try {
      const res = await DrawnObjServices.addOne({
        userId,
        paperId,
        data,
      });

      callback(res);
      socket.to(paperId).emit('sv:drawn_obj:add', res);
    } catch (err) {
      console.log('add error');
    }
  }

  async function reAddMany(drawnObjIdList: string[], callback: (data: any[] | null) => void) {
    const t = await sequelize.transaction();
    try {
      const result = await DrawnObjServices.reAddMany({ drawnObjIdList, userId }, t);
      if (result) {
        await t.commit();

        let drawnList = await DrawnObject.findAll({
          where: {
            id: drawnObjIdList,
          },
          include: [
            {
              model: ChangeLog,
              include: [{ model: User, attributes: ['id', 'username'] }],
            },
          ],
        });

        callback(drawnList);
        socket.to(paperId).emit('sv:drawn_obj:re_add_many', drawnList);
      } else {
        throw new Error('Remove error');
      }
    } catch (error) {
      await t.rollback();
      callback(null);
      console.log(error);
    }
  }

  async function removeObj(drawnObjId: string, callback: (data: any) => void) {
    console.log('remove one', drawnObjId);
    try {
      const drawnObj = await DrawnObjServices.updateOne({
        data: null,
        drawnObjId,
        userId,
        updateType: CHANGE_LOG_TYPE.DELETE,
      });
      if (drawnObj) {
        socket.to(paperId).emit('sv:drawn_obj:remove_one', drawnObj);
        callback(drawnObj);
      }
    } catch (error) {
      console.log('remove drawnobj error', error);
    }
  }

  async function updateObj(canvasObj: CanvasObject, callback: (data: any) => void) {
    const drawnObj = await DrawnObjServices.updateOne({
      data: { value: canvasObj },
      drawnObjId: canvasObj.id,
      userId,
      updateType: CHANGE_LOG_TYPE.UPDATE,
    });
    if (!drawnObj) {
      console.log('update error');
    } else {
      callback(drawnObj);
      socket.to(paperId).emit('sv:drawn_obj:update_one', drawnObj);
    }
  }

  async function removeMany(drawnObjIdList: string[], callback: (data: any[] | null) => void) {
    const t = await sequelize.transaction();
    try {
      const result = await DrawnObjServices.removeMany({ drawnObjIdList, userId }, t);
      if (result) {
        await t.commit();

        let drawnList = await DrawnObject.findAll({
          where: {
            id: drawnObjIdList,
          },
          include: [
            {
              model: ChangeLog,
              include: [{ model: User, attributes: ['id', 'username'] }],
            },
          ],
        });
        console.log(drawnList.length);

        callback(drawnList);
        socket.to(paperId).emit('sv:drawn_obj:remove_many', drawnList);
      } else {
        throw new Error('Remove error');
      }
    } catch (error) {
      await t.rollback();
      callback(null);
      console.log(error);
    }
  }

  async function updateMany(canvasObjList: CanvasObject[], callback: (data: any[] | null) => void) {
    console.log('update');
    const t = await sequelize.transaction();
    try {
      const result = await DrawnObjServices.updateMany({ canvasObjList, userId }, t);
      t.commit();
      if (result) {
        let list = await DrawnObject.findAll({
          where: {
            id: canvasObjList.map((item) => item.id),
          },
          include: [
            {
              model: ChangeLog,
              include: [{ model: User, attributes: ['id', 'username'] }],
            },
          ],
        });
        callback(list);

        socket.to(paperId).emit('sv:drawn_obj:update_many', list);
      } else {
        throw new Error('Update error');
      }
    } catch (error) {
      console.log(error);
      await t.rollback();
      callback(null);
    }
  }
};

type CanvasObject = {
  id: string;
  [key: string]: any;
};
