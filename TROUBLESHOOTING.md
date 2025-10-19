# 🔧 Guia de Troubleshooting Completo

## Problema: "Container não encontrado" em modo headless

### Causa
O YouTube pode estar:
1. Carregando de forma diferente em modo headless
2. Detectando automação e bloqueando
3. O vídeo realmente não está ao vivo

### Solução

#### 1️⃣ Verifique se funciona em modo debug
```powershell
npm run debug
```

Se funcionar no debug mas não no teste:
- ✅ O vídeo está ao vivo
- ✅ O chat existe
- ❌ Problema com modo headless

#### 2️⃣ Melhorias já implementadas

O código agora tem:
- ✅ User-Agent realista
- ✅ Headers HTTP extras
- ✅ Espera de 3 segundos após carregar
- ✅ Scroll automático para forçar renderização
- ✅ Múltiplos seletores de fallback
- ✅ Logs de debug detalhados

#### 3️⃣ Se ainda não funcionar

**Opção A: Use modo não-headless no teste**

Edite `src/test.js` e adicione:
```javascript
const controller = await startChatScraper(testVideoId, {
  wsEndpoint: null,
  headlessMode: false // Força browser visível
});
```

**Opção B: Teste com outro vídeo**

Use uma live 24/7 conhecida:
```powershell
# Lofi Girl (geralmente sempre ao vivo)
node src/test.js jfKfPfyJRdk

# Ou procure por "24/7 live stream" no YouTube
```

**Opção C: Verifique o HTML carregado**

O script agora mostra o início do HTML em caso de erro.
Procure por mensagens como:
```
[scraper] Início do HTML da página: ...
```

## Diferenças entre Debug e Test

| Característica | Debug | Test |
|----------------|-------|------|
| Browser visível | ✅ Sim | ❌ Não (headless) |
| Screenshots | ✅ Sim | ❌ Não |
| Velocidade | 🐌 Mais lento | 🚀 Mais rápido |
| Consumo RAM | 📈 Maior | 📉 Menor |

## Checklist de Verificação

Antes de reportar um bug, verifique:

- [ ] O vídeo está **AO VIVO** neste momento?
- [ ] O chat está visível quando você abre a URL no navegador normal?
- [ ] Você rodou `npm install`?
- [ ] O VIDEO_ID está correto no `.env`?
- [ ] Funciona com `npm run debug`?
- [ ] Tentou com outro vídeo/live?

## Logs Normais vs. Anormais

### ✅ Logs NORMAIS (funcionando)
```
[scraper] Iniciando browser...
[scraper] Navegando para: https://...
[scraper] Título da página: YouTube
[scraper] ✓ Container encontrado: yt-live-chat-item-list-renderer
[scraper] [Observer] Container encontrado com seletor: ...
[scraper] [Observer] 47 mensagens existentes encontradas
[scraper] [Observer] MutationObserver ativo
[scraper] ✓ Monitorando chat: ...

[Usuario1] Mensagem aqui
```

### ❌ Logs ANORMAIS (problema)
```
[scraper] [Observer] Container não encontrado, tentando novamente...
[scraper] [Observer] HTML disponível: sim
[scraper] [Observer] Elementos yt-live-chat: 0
```

Se ver "Elementos yt-live-chat: 0":
- O YouTube não carregou o chat
- Pode ser detecção de bot
- Vídeo não está ao vivo

## Solução Definitiva: Modo Híbrido

Se você precisa de performance mas o headless não funciona, use:

```javascript
// Em src/test.js ou src/index.js
const controller = await startChatScraper(testVideoId, {
  wsEndpoint: null,
  headlessMode: 'new', // ou 'false' para desabilitar
  browserArgs: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled', // Oculta automação
    '--window-size=1920,1080' // Tamanho de janela realista
  ]
});
```

## Teste de Conectividade

Para verificar se consegue acessar o YouTube:

```powershell
# Windows PowerShell
Test-NetConnection www.youtube.com -Port 443
```

## Última Opção: Modo Persistente

Se nada funcionar, use modo não-headless persistente:

Crie `src/test-persistent.js`:
```javascript
const controller = await startChatScraper(testVideoId, {
  wsEndpoint: null,
  headlessMode: false, // Browser visível
  debug: true         // Logs completos
});
```

Isso garante que funcione igual ao debug mode.

## Suporte

Se seguiu todos os passos e ainda não funciona:
1. Rode `npm run debug`
2. Tire um screenshot do browser aberto
3. Copie os logs completos
4. Verifique se o vídeo está realmente ao vivo

## FAQ

**P: Por que funciona no debug mas não no test?**
R: O YouTube pode detectar modo headless. Use a solução híbrida acima.

**P: Posso forçar modo não-headless no teste?**
R: Sim, edite `src/test.js` e mude `headlessMode: false`.

**P: O teste fica preso em "Container não encontrado"?**
R: O vídeo provavelmente não está ao vivo. Teste com outro ID.

**P: Como saber se um vídeo está ao vivo?**
R: Abra a URL no navegador normal. Se o chat aparecer no lado direito, está ao vivo.
