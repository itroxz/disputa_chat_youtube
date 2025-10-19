# Exemplos de Lives para Testar

## ⚠️ IMPORTANTE
O script **só funciona** com vídeos que estão **AO VIVO** no momento da execução.
Vídeos gravados ou transmissões encerradas NÃO terão chat ativo.

## Como encontrar lives ativas

### Método 1: Busca no YouTube
1. Acesse: https://www.youtube.com/results?search_query=live+now
2. Filtre por "Ao vivo" (Live)
3. Escolha uma transmissão com bastante visualizadores

### Método 2: Canais 24/7
Alguns canais transmitem 24h por dia:

- **Lofi Girl**: https://www.youtube.com/@LofiGirl/live
- **Notícias 24h**: Busque por "news 24/7 live"
- **Músicas**: Busque por "music 24/7 live"
- **Gaming**: Busque por "gaming live"

### Método 3: Eventos ao vivo
- Procure por eventos esportivos
- Transmissões de notícias
- Gameplays ao vivo
- Lives de streamers

## Extraindo o VIDEO_ID

De uma URL como:
```
https://www.youtube.com/watch?v=jfKfPfyJRdk
```

O VIDEO_ID é: `jfKfPfyJRdk`

De uma URL como:
```
https://www.youtube.com/live/ABC123xyz
```

O VIDEO_ID é: `ABC123xyz`

## Testando
```bash
# No .env
VIDEO_ID=ID_DA_LIVE_AQUI

# Ou via linha de comando
node src/test.js ID_DA_LIVE_AQUI
```

## Verificando se uma live tem chat

1. Abra a URL da live no navegador
2. Veja se o chat aparece no lado direito
3. Se sim, o scraper funcionará!
4. Se não, procure outra live

## Dica: Lofi Girl

A **Lofi Girl** geralmente tem uma transmissão 24/7 ativa:
```bash
# Encontre a live atual em:
# https://www.youtube.com/@LofiGirl/live

# Depois pegue o ID e teste:
npm run debug
```
