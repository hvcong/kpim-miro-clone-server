import { Socket } from 'socket.io';
import { verifySocketConnection } from './utils/verify';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const router = require('./routes');
const bodyParser = require('body-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
const drawnHandler = require('./socketio/drawnHandler');
const { validateToken } = require('./utils/verify');
const paperHandle = require('./socketio/paperHandle');
const templateHandler = require('./socketio/templateHandler');
require('./configs/persist');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.use(verifySocketConnection);

io.on('connection', (socket: Socket) => {
  paperHandle(io, socket);
  drawnHandler(io, socket);
  templateHandler(io, socket);
});

app.use(bodyParser.json());

app.use(
  cors({
    origin: '*',
  }),
);

//static files
app.use(express.static('public'));

// handle router
router(app);

const port = process.env.PORT || 5000;
httpServer.listen(port, () => {
  console.log('App listening at: http://localhost:' + port);
});
