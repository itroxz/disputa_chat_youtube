'use strict';

const { WebSocketServer } = require('ws');

const PORT = Number(process.env.WS_PORT || 3000);

const wss = new WebSocketServer({ port: PORT });

wss.on('listening', () => {
  console.log(`Servidor WebSocket escutando em ws://localhost:${PORT}`);
});

wss.on('connection', (socket, request) => {
  console.log('Cliente conectado:', request.socket.remoteAddress);

  socket.on('message', (message) => {
    console.log('Mensagem recebida:', message.toString());
  });

  socket.on('close', () => {
    console.log('Cliente desconectado');
  });

  socket.on('error', (error) => {
    console.error('Erro no WebSocket:', error.message);
  });
});

wss.on('error', (error) => {
  console.error('Erro no servidor WebSocket:', error.message);
});
