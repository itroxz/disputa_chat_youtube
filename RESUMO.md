# Resumo do Sistema YouTube Live Chat Scraper

## ✅ O que foi implementado

### Arquivos criados:

1. **src/chatScraper.js** - Motor principal do scraper
   - Puppeteer com headless mode otimizado
   - MutationObserver para detectar novas mensagens
   - Normalização de VIDEO_ID (aceita URLs completas)
   - Deduplicação com Set
   - Reconexão automática
   - Suporte a WebSocket opcional
   - Modo debug com screenshots

2. **src/index.js** - Ponto de entrada padrão
   - Carrega configurações do .env
   - Suporta WebSocket
   - Tratamento de sinais (CTRL+C)

3. **src/test.js** - Teste simplificado
   - Sem WebSocket
   - Apenas console
   - Ideal para testes rápidos

4. **src/debug.js** - Modo debug
   - Browser visível (não headless)
   - Screenshots automáticos
   - Logs detalhados
   - Perfeito para troubleshooting

5. **server.js** - Servidor WebSocket de exemplo
   - Escuta em localhost:3000
   - Recebe e loga mensagens
   - Pronto para integração

6. **package.json** - Dependências e scripts
   - puppeteer: navegação headless
   - ws: WebSocket client/server
   - dotenv: variáveis de ambiente

7. **.env** - Configurações
   - VIDEO_ID: ID ou URL do vídeo
   - WS_ENDPOINT: endpoint WebSocket (opcional)

8. **README.md** - Documentação completa
9. **EXEMPLOS_LIVES.md** - Guia para encontrar lives ativas

## 🎯 Funcionalidades

✅ Acessa diretamente `https://www.youtube.com/live_chat?v=<ID>`
✅ Monitora mensagens com MutationObserver
✅ Captura autor e texto
✅ Exibe no console: `[Autor] Mensagem`
✅ Envia via WebSocket (opcional)
✅ Evita duplicatas (Set + Queue LRU)
✅ Reconexão automática
✅ Headless otimizado (--no-sandbox, --disable-dev-shm-usage, --disable-gpu)
✅ Função reutilizável: `startChatScraper(videoId, options)`
✅ Aceita múltiplos formatos de URL
✅ Modo debug com browser visível
✅ Screenshots em caso de erro
✅ Logs detalhados

## 🚀 Como usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar
Edite `.env` com um VIDEO_ID de uma live **AO VIVO**

### 3. Testar
```bash
# Teste simples (sem WebSocket)
npm run test

# Debug visual
npm run debug

# Com WebSocket (terminal 1)
npm run server

# Com WebSocket (terminal 2)
npm start
```

## ⚠️ Pontos importantes

1. **O vídeo DEVE estar AO VIVO**
   - Vídeos gravados não têm chat ativo
   - Use `npm run debug` para verificar

2. **WebSocket é opcional**
   - Deixe `WS_ENDPOINT=` vazio para desabilitar
   - Ou rode `npm run server` para ativar

3. **Seletores robustos**
   - Tenta múltiplos seletores CSS
   - Funciona mesmo com mudanças no YouTube
   - Logs detalhados para debug

4. **Performance**
   - Args otimizados para baixo consumo
   - Deduplicação eficiente
   - Reconexão inteligente

## 📊 Estrutura do código

```
startChatScraper(videoId, options)
  ├── normalizeVideoId()        → Aceita URL ou ID
  ├── connectWebSocket()        → Conexão WS (opcional)
  ├── spawnBrowser()            → Inicia Puppeteer
  │   ├── page.goto()          → Navega para chat
  │   ├── waitForSelector()    → Aguarda container
  │   └── injectObserver()     → Injeta MutationObserver
  │       ├── tryObserve()     → Encontra container
  │       ├── emitMessage()    → Extrai autor/texto
  │       └── observer.observe() → Monitora mudanças
  └── return { stop() }         → Controle manual
```

## 🔮 Próximos passos (futuro)

Para múltiplas lives simultâneas, use Puppeteer Cluster:

```javascript
const { Cluster } = require('puppeteer-cluster');

const cluster = await Cluster.launch({
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 5,
});

await cluster.task(async ({ page, data: videoId }) => {
  // Adapte a lógica do chatScraper.js aqui
});

cluster.queue('VIDEO_ID_1');
cluster.queue('VIDEO_ID_2');
cluster.queue('VIDEO_ID_3');
```

## 🐛 Debug

Se não funcionar:

1. `npm run debug` → Ver o que acontece no browser
2. Verificar se a live está AO VIVO
3. Verificar logs `[Observer]` e `[scraper]`
4. Ver screenshots em `debug-chat.png` e `debug-error.png`

## 📝 Logs típicos de sucesso

```
[scraper] Iniciando browser...
[scraper] Navegando para: https://www.youtube.com/live_chat?v=VIDEO_ID
[scraper] ✓ Container encontrado: yt-live-chat-item-list-renderer
[scraper] [Observer] Container encontrado, iniciando observação...
[scraper] [Observer] 47 mensagens existentes encontradas
[scraper] [Observer] MutationObserver ativo
[scraper] ✓ Monitorando chat: https://www.youtube.com/live_chat?v=VIDEO_ID
[ws] Conectado.

[Player123] Vamos time!!!
[MariaGamer] Kkkkk boa jogada 😂
```

## ✨ Código limpo e comentado

- Funções bem nomeadas
- Comentários explicativos
- Tratamento de erros robusto
- Fácil de adaptar e estender
- Pronto para produção
