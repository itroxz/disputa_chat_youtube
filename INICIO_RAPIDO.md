# 🚀 Início Rápido - 3 minutos

## Passo 1: Instalar (30s)
```powershell
npm install
```

## Passo 2: Encontrar uma live ativa (1min)

1. Acesse: https://www.youtube.com/results?search_query=live+now
2. Clique em uma transmissão AO VIVO
3. Copie o ID da URL

Exemplo:
- URL: `https://www.youtube.com/watch?v=jfKfPfyJRdk`
- ID: `jfKfPfyJRdk`

## Passo 3: Configurar (30s)

Edite o arquivo `.env`:
```env
VIDEO_ID=jfKfPfyJRdk
WS_ENDPOINT=
```

## Passo 4: Testar (1min)

```powershell
npm run test
```

Você deverá ver:
```
[scraper] Iniciando browser...
[scraper] ✓ Container encontrado: yt-live-chat-item-list-renderer
[scraper] ✓ Monitorando chat: https://www.youtube.com/live_chat?v=...

[Usuario1] Mensagem 1
[Usuario2] Mensagem 2
```

## 🎉 Pronto!

Se funcionou, você verá as mensagens do chat aparecendo em tempo real.

## ❌ Não funcionou?

### Erro: "Container não encontrado"
**Causa:** O vídeo não está ao vivo ou não tem chat.
**Solução:** Encontre outro vídeo que esteja AO VIVO AGORA.

### Ver o que está acontecendo
```powershell
npm run debug
```

Isso abre o browser visível para você ver o que está acontecendo.

## ➕ Opcional: WebSocket

Se quiser enviar as mensagens para um servidor WebSocket:

**Terminal 1:**
```powershell
npm run server
```

**Terminal 2:**
Edite `.env`:
```env
WS_ENDPOINT=ws://localhost:3000
```

Depois:
```powershell
npm start
```

## 📖 Mais informações

- `README.md` - Documentação completa
- `EXEMPLOS_LIVES.md` - Como encontrar lives
- `RESUMO.md` - Visão técnica do sistema

## 💡 Dicas

1. **Lofi Girl** geralmente tem transmissão 24/7: https://www.youtube.com/@LofiGirl/live
2. Use canais de notícias que transmitem 24h
3. Procure por "24/7 live stream"

## 🆘 Ajuda

Se ainda não funcionar:
1. Execute `npm run debug` e veja o browser
2. Verifique se o vídeo está AO VIVO (não gravado)
3. Verifique se o chat está visível no lado direito
4. Teste com outro vídeo

Boa sorte! 🎊
