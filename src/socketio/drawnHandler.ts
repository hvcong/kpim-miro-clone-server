import { Server, Socket } from 'socket.io';
import { DrawnObjServices, DrawnObject } from '../models/DrawObject.model';
import { CHANGE_LOG_TYPE } from '../models/ChangeLog.model';

module.exports = (io: Server, socket: Socket & { paperId: string; userId: string }) => {
  const paperId = socket.paperId;
  const userId = socket.userId;

  socket.on('drawn_obj:add', addObj);

  socket.on('drawn_obj:remove_one', removeObj);

  socket.on('drawn_obj:update_one', updateObj);

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
};

type CanvasObject = {
  id: string;
  [key: string]: any;
};
