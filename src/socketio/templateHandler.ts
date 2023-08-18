import { Server, Socket } from 'socket.io';
import { TemplateServices } from '../models/Template.model';

module.exports = async (io: Server, socket: Socket & { paperId: string; userId: string }) => {
  //   const paperId = socket.paperId;
  const userId = socket.userId;

  socket.on('template:add', async (data: { list: [] }, callback: (newTemplate: any) => void) => {
    try {
      const template = await TemplateServices.createTemplate(userId, data);
      if (!template) throw new Error('Add template err');
      callback(template);
    } catch (error) {
      console.log(error);
      callback(null);
    }
  });
};
