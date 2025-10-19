# YouTube Live Chat Scraper

Sistema de captura de mensagens do chat ao vivo do YouTube em tempo real usando Puppeteer e WebSocket.

## 🚀 Instalação

```bash
npm install
```

## ⚙️ Configuração

Edite o arquivo `.env`:

```env
# ID ou URL completa do vídeo do YouTube
VIDEO_ID=1xaLqhic_6Q
# ou
VIDEO_ID=https://www.youtube.com/watch?v=1xaLqhic_6Q

# Endpoint do WebSocket (deixe vazio para desabilitar)
WS_ENDPOINT=ws://localhost:3000

# Modo headless: 'new' (invisível), 'false' (visível)
HEADLESS_MODE=new
```

## 📋 Uso

### Teste Rápido (Recomendado)

```bash
npm run test
```

Browser **visível** - mais confiável, perfeito para desenvolvimento.

### Teste Headless (Sem Browser Visível)

```bash
npm run test-headless
```

Browser **invisível** - para testar modo produção. Se funcionar por 5 minutos, está OK para deploy!

**Nota:** Se o headless não capturar mensagens, o YouTube pode estar detectando automação. Nesse caso, use o modo visível ou instale `puppeteer-extra-plugin-stealth`.

### Debug Mode (ver tudo acontecendo)

```bash
npm run debug
```

Modo especial para troubleshooting com logs completos e screenshots.

### Modo Completo (com WebSocket)

**Terminal 1 - Servidor WebSocket:**
```bash
npm run server
```

**Terminal 2 - Scraper:**
```bash
npm start
```

### Teste com Vídeo Específico

```bash
node src/test.js VIDEO_ID_AQUI
```

## 📁 Estrutura do Projeto

```
botchat/
├── src/
│   ├── chatScraper.js  # Motor principal do scraper
│   ├── index.js        # Ponto de entrada com WebSocket
│   └── test.js         # Script de teste simples
├── server.js           # Servidor WebSocket de exemplo
├── package.json
└── .env                # Configurações
```

## 🔧 Como Funciona

1. **Puppeteer** abre o chat do YouTube em modo headless
2. **MutationObserver** monitora novas mensagens no DOM
3. Cada mensagem é:
   - Exibida no console como `[Autor] Texto`
   - Enviada via WebSocket (se habilitado)
   - Deduplicada usando Set

## 🎯 Recursos

✅ Acessa diretamente o link do chat  
✅ Monitora mensagens em tempo real com MutationObserver  
✅ Captura autor e texto de cada mensagem  
✅ Envia via WebSocket para servidor local  
✅ Evita duplicatas com Set  
✅ Reconexão automática  
✅ Headless mode otimizado  
✅ Função `startChatScraper(videoId)` reutilizável  
✅ Suporte para múltiplos formatos de URL do YouTube

## 🐛 Troubleshooting

### Passo 1: Use o modo debug
```bash
npm run debug
```

Isso vai abrir o browser visível e você poderá ver:
- Se a página do chat carrega corretamente
- Se há alguma mensagem de erro
- Se o chat realmente existe

### "Container não encontrado"
Possíveis causas:
- ❌ O vídeo **NÃO está ao vivo** (apenas vídeos LIVE têm chat ativo)
- ❌ O chat está desabilitado pelo criador
- ❌ ID do vídeo incorreto
- ❌ Vídeo privado ou restrito

**Solução:** Use um vídeo que esteja **AO VIVO AGORA** com chat habilitado.

### "Erro na conexão WebSocket (1006)"
- ✅ Servidor WebSocket não está rodando
- Execute `npm run server` em outro terminal
- Ou desabilite o WebSocket no `.env` deixando `WS_ENDPOINT=` vazio

### Nenhuma mensagem aparece
1. Verifique se o vídeo está AO VIVO
2. Use `npm run debug` para ver o browser
3. Confira se há mensagens sendo enviadas no chat em tempo real
4. Verifique os logs `[Observer]` para debug

### Como encontrar uma live ativa para testar
1. Acesse youtube.com
2. Procure por "live now" ou "ao vivo"
3. Encontre uma transmissão com chat ativo
4. Copie o ID do vídeo (parte depois de `v=` na URL)
5. Atualize o `.env` com o novo ID

## 📝 Exemplo de Saída

```
[scraper] Iniciando browser...
[scraper] Navegando para: https://www.youtube.com/live_chat?v=1xaLqhic_6Q
[scraper] [Observer] Container encontrado, iniciando observação...
[scraper] [Observer] 47 mensagens existentes encontradas
[scraper] [Observer] MutationObserver ativo
[scraper] ✓ Monitorando chat: https://www.youtube.com/live_chat?v=1xaLqhic_6Q
[ws] Conectado.

[Player123] Vamos time!!!
[MariaGamer] Kkkkk boa jogada 😂
[JoaoLive] GG galera
```

## 🔮 Próximos Passos

Para monitorar múltiplas lives simultaneamente, integre com **Puppeteer Cluster**:

```javascript
const { Cluster } = require('puppeteer-cluster');

const cluster = await Cluster.launch({
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 5,
});

await cluster.task(async ({ page, data: videoId }) => {
  // Use a lógica do chatScraper.js aqui
});

cluster.queue('VIDEO_ID_1');
cluster.queue('VIDEO_ID_2');
```
