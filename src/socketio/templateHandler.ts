import { Server, Socket } from 'socket.io';
import { TemplateServices } from '../models/Template.model';

module.exports = async (io: Server, socket: Socket & { paperId: string; userId: string }) => {
  //   const paperId = socket.paperId;
  const userId = socket.userId;
};
