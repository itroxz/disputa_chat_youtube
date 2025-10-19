'use strict';

const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;  // Porta do servidor web
const WS_PORT = 3001; // Porta para clientes web
const WS_SCRAPER_PORT = 3000; // Porta para o scraper

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Estado da aplicação
let config = {
  titulo: '⚡ VOTAÇÃO ⚡',
  opcao1: { palavra: 'time1', nome: 'Time 1', cor: '#3498db' },
  opcao2: { palavra: 'time2', nome: 'Time 2', cor: '#e74c3c' }
};

let votos = {
  opcao1: 0,
  opcao2: 0
};

let mensagensProcessadas = new Set();
const clientes = new Set();

// ==================== ROTAS API ====================

// GET: Obter configuração atual
app.get('/api/config', (req, res) => {
  res.json(config);
});

// POST: Atualizar configuração
app.post('/api/config', (req, res) => {
  const { titulo, opcao1, opcao2 } = req.body;
  
  if (!opcao1?.palavra || !opcao2?.palavra) {
    return res.status(400).json({ error: 'Palavras são obrigatórias' });
  }

  config = {
    titulo: titulo || '⚡ VOTAÇÃO ⚡',
    opcao1: {
      palavra: opcao1.palavra.toLowerCase(),
      nome: opcao1.nome || opcao1.palavra,
      cor: opcao1.cor || '#3498db'
    },
    opcao2: {
      palavra: opcao2.palavra.toLowerCase(),
      nome: opcao2.nome || opcao2.palavra,
      cor: opcao2.cor || '#e74c3c'
    }
  };

  console.log('✓ Configuração atualizada:', config);
  
  // Notificar todos os clientes da nova config
  broadcast({ type: 'config', data: config });
  
  res.json({ success: true, config });
});

// GET: Obter votos atuais
app.get('/api/votos', (req, res) => {
  res.json(votos);
});

// POST: Resetar votos
app.post('/api/votos/reset', (req, res) => {
  votos = { opcao1: 0, opcao2: 0 };
  mensagensProcessadas.clear();
  
  console.log('✓ Votos resetados');
  
  broadcast({ type: 'votos', data: votos });
  
  res.json({ success: true, votos });
});

// ==================== WEBSOCKET PARA CLIENTES WEB ====================

const wssClientes = new WebSocket.Server({ port: WS_PORT });

wssClientes.on('connection', (ws) => {
  console.log('🌐 Cliente web conectado');
  clientes.add(ws);
  
  // Enviar estado atual ao conectar
  ws.send(JSON.stringify({ type: 'config', data: config }));
  ws.send(JSON.stringify({ type: 'votos', data: votos }));
  
  ws.on('close', () => {
    clientes.delete(ws);
    console.log('🌐 Cliente web desconectado');
  });
  
  ws.on('error', (err) => {
    console.error('Erro no cliente web:', err.message);
    clientes.delete(ws);
  });
});

// Broadcast para todos os clientes web
function broadcast(message) {
  const data = JSON.stringify(message);
  clientes.forEach(cliente => {
    if (cliente.readyState === WebSocket.OPEN) {
      cliente.send(data);
    }
  });
}

// ==================== WEBSOCKET PARA SCRAPER ====================

const wss = new WebSocket.Server({ port: WS_SCRAPER_PORT });

wss.on('connection', (socket) => {
  console.log('🤖 Scraper conectado!');
  
  socket.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      processarMensagem(msg);
    } catch (err) {
      console.error('Erro ao processar mensagem:', err.message);
    }
  });
  
  socket.on('close', () => {
    console.log('🤖 Scraper desconectado');
  });
});

// ==================== PROCESSAMENTO DE MENSAGENS ====================

function processarMensagem(msg) {
  const { author, text, id, capturedAt } = msg;
  const textoLower = text.toLowerCase();
  
  // Evitar duplicatas
  const msgId = id || `${author}_${text}_${capturedAt}`;
  if (mensagensProcessadas.has(msgId)) return;
  mensagensProcessadas.add(msgId);
  
  // Limpar cache se ficar muito grande
  if (mensagensProcessadas.size > 10000) {
    const arr = Array.from(mensagensProcessadas);
    mensagensProcessadas = new Set(arr.slice(-5000));
  }
  
  // Verificar se contém palavra-chave
  let votou = false;
  
  if (textoLower.includes(config.opcao1.palavra)) {
    votos.opcao1++;
    votou = true;
    console.log(`✓ [${author}] votou em "${config.opcao1.nome}": ${text}`);
  }
  
  if (textoLower.includes(config.opcao2.palavra)) {
    votos.opcao2++;
    votou = true;
    console.log(`✓ [${author}] votou em "${config.opcao2.nome}": ${text}`);
  }
  
  // Broadcast votos atualizados
  if (votou) {
    broadcast({ 
      type: 'votos', 
      data: votos,
      mensagem: { author, text }
    });
  }
}

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║       🎮 SERVIDOR DE VOTAÇÃO EM TEMPO REAL          ║');
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log(`║  📊 Painel Config: http://localhost:${PORT}/config.html  ║`);
  console.log(`║  🎨 Overlay OBS:   http://localhost:${PORT}/overlay.html ║`);
  console.log(`║  🤖 WebSocket Scraper: ws://localhost:${WS_SCRAPER_PORT}           ║`);
  console.log(`║  🌐 WebSocket Clientes: ws://localhost:${WS_PORT}          ║`);
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log('║  Configuração atual:                                 ║');
  console.log(`║  • Opção 1: "${config.opcao1.nome}" (${config.opcao1.palavra})              ║`);
  console.log(`║  • Opção 2: "${config.opcao2.nome}" (${config.opcao2.palavra})              ║`);
  console.log('╚═══════════════════════════════════════════════════════╝');
});

console.log('\n💡 Aguardando conexão do scraper...\n');
