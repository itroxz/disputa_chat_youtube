# Exemplos de Uso Avançado

## Uso Programático

### Exemplo 1: Uso básico

```javascript
const { startChatScraper } = require('./src/chatScraper');

(async () => {
  const controller = await startChatScraper('VIDEO_ID_AQUI');
  
  // Para parar depois de 1 minuto
  setTimeout(async () => {
    await controller.stop();
  }, 60000);
})();
```

### Exemplo 2: Com opções customizadas

```javascript
const { startChatScraper } = require('./src/chatScraper');

(async () => {
  const controller = await startChatScraper('VIDEO_ID_AQUI', {
    wsEndpoint: null,              // Desabilita WebSocket
    headlessMode: false,           // Mostra o browser
    debug: true,                   // Ativa logs detalhados
    reconnectDelayMs: 5000,        // Reconecta após 5s
    dedupeCacheSize: 500          // Cache menor de dedup
  });
})();
```

### Exemplo 3: Processar mensagens customizado

```javascript
const { startChatScraper } = require('./src/chatScraper');

// Sobrescrever o handler de mensagens
const originalConsoleLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  
  // Filtra apenas mensagens com hashtag
  if (message.includes('#')) {
    originalConsoleLog('HASHTAG DETECTADA:', ...args);
    
    // Salva em arquivo, banco de dados, etc
    // saveToDatabase(message);
  }
  
  originalConsoleLog(...args);
};

(async () => {
  await startChatScraper('VIDEO_ID_AQUI', { wsEndpoint: null });
})();
```

### Exemplo 4: Múltiplas lives (sequencial)

```javascript
const { startChatScraper } = require('./src/chatScraper');

const videoIds = ['VIDEO_ID_1', 'VIDEO_ID_2', 'VIDEO_ID_3'];
const controllers = [];

(async () => {
  for (const videoId of videoIds) {
    try {
      const controller = await startChatScraper(videoId, {
        wsEndpoint: null
      });
      controllers.push(controller);
      console.log(`✓ Scraper iniciado para ${videoId}`);
    } catch (error) {
      console.error(`✗ Falha ao iniciar ${videoId}:`, error.message);
    }
  }
  
  // Parar todos após 5 minutos
  setTimeout(async () => {
    for (const controller of controllers) {
      await controller.stop();
    }
    process.exit(0);
  }, 300000);
})();
```

### Exemplo 5: Integração com Discord Bot

```javascript
const { startChatScraper } = require('./src/chatScraper');
const { Client, GatewayIntentBits } = require('discord.js');

const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const DISCORD_CHANNEL_ID = 'SEU_CHANNEL_ID';

// Intercepta console.log para enviar ao Discord
const originalConsoleLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  
  // Se é uma mensagem do chat (formato: [Autor] Texto)
  if (message.match(/^\[.+\]/)) {
    const channel = discordClient.channels.cache.get(DISCORD_CHANNEL_ID);
    if (channel) {
      channel.send(message);
    }
  }
  
  originalConsoleLog(...args);
};

discordClient.on('ready', async () => {
  console.log('Discord bot conectado!');
  await startChatScraper('VIDEO_ID_AQUI', { wsEndpoint: null });
});

discordClient.login('SEU_DISCORD_BOT_TOKEN');
```

### Exemplo 6: Salvar em banco de dados

```javascript
const { startChatScraper } = require('./src/chatScraper');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./chat_messages.db');

db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT,
    message TEXT,
    timestamp INTEGER
  )
`);

// Intercepta console.log
const originalConsoleLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  
  // Parse: [Autor] Mensagem
  const match = message.match(/^\[(.+?)\] (.+)$/);
  if (match) {
    const [, author, text] = match;
    
    db.run(
      'INSERT INTO messages (author, message, timestamp) VALUES (?, ?, ?)',
      [author, text, Date.now()],
      (err) => {
        if (err) console.error('Erro ao salvar:', err);
      }
    );
  }
  
  originalConsoleLog(...args);
};

(async () => {
  await startChatScraper('VIDEO_ID_AQUI', { wsEndpoint: null });
})();
```

### Exemplo 7: WebSocket customizado

```javascript
const { startChatScraper } = require('./src/chatScraper');

// Seu próprio servidor WebSocket
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// Função para broadcast
function broadcast(data) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Intercepta mensagens
const originalConsoleLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  const match = message.match(/^\[(.+?)\] (.+)$/);
  
  if (match) {
    broadcast({
      author: match[1],
      text: match[2],
      timestamp: Date.now()
    });
  }
  
  originalConsoleLog(...args);
};

(async () => {
  await startChatScraper('VIDEO_ID_AQUI', { wsEndpoint: null });
})();
```

### Exemplo 8: Filtro de palavras-chave

```javascript
const { startChatScraper } = require('./src/chatScraper');

const keywords = ['giveaway', 'sorteio', 'concurso', '!comando'];

const originalConsoleLog = console.log;
console.log = function(...args) {
  const message = args.join(' ').toLowerCase();
  
  const hasKeyword = keywords.some(kw => message.includes(kw));
  
  if (hasKeyword) {
    originalConsoleLog('🔔 PALAVRA-CHAVE DETECTADA:', ...args);
    // Enviar notificação, alertar moderador, etc
  } else {
    originalConsoleLog(...args);
  }
};

(async () => {
  await startChatScraper('VIDEO_ID_AQUI', { wsEndpoint: null });
})();
```

## Integração com Puppeteer Cluster

Para múltiplas lives simultâneas com melhor gerenciamento:

```javascript
const { Cluster } = require('puppeteer-cluster');

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 5,
    puppeteerOptions: {
      headless: 'new',
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    }
  });

  await cluster.task(async ({ page, data: videoId }) => {
    // Adapte a lógica do chatScraper.js aqui
    const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}`;
    
    await page.goto(chatUrl, { waitUntil: 'networkidle2' });
    
    await page.evaluate(() => {
      // Cole aqui a lógica do MutationObserver do chatScraper.js
    });
    
    console.log(`Monitorando: ${videoId}`);
  });

  // Adiciona múltiplas lives
  cluster.queue('VIDEO_ID_1');
  cluster.queue('VIDEO_ID_2');
  cluster.queue('VIDEO_ID_3');

  // Mantém rodando
  await cluster.idle();
})();
```

## Dicas Avançadas

1. **Rate Limiting**: YouTube pode bloquear IPs que fazem muitas requisições
2. **Proxy Rotation**: Use proxies diferentes para cada live
3. **User Agents**: Varie o User-Agent para parecer mais natural
4. **Cookies**: Salve e reutilize cookies para sessões persistentes
5. **Erro Handling**: Sempre tenha fallbacks e logs detalhados

## Performance

Para otimizar ainda mais:

```javascript
const controller = await startChatScraper('VIDEO_ID', {
  browserArgs: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-images',      // Não carrega imagens
    '--blink-settings=imagesEnabled=false'
  ]
});
```

Isso reduz drasticamente o uso de memória e CPU.
