# 📝 Changelog - Correções e Melhorias

## [1.0.1] - 2025-10-19

### 🐛 Bug Fixes

#### **CRÍTICO: Erro "page.waitForTimeout is not a function"**

**Problema:**
```
[scraper] Falha ao carregar o chat: page.waitForTimeout is not a function
[scraper] Reiniciando em 10000ms (erro ao carregar chat).
```

**Causa:**
O método `page.waitForTimeout()` foi depreciado e removido nas versões recentes do Puppeteer (v21+).

**Solução:**
Substituído por `new Promise(resolve => setTimeout(resolve, ms))` que funciona em todas as versões.

**Antes:**
```javascript
await page.waitForTimeout(3000);
await page.waitForTimeout(1000);
```

**Depois:**
```javascript
await new Promise(resolve => setTimeout(resolve, 3000));
await new Promise(resolve => setTimeout(resolve, 1000));
```

**Impacto:**
- ✅ Sistema agora funciona com Puppeteer v21+ e v22+
- ✅ Não há mais reinicializações por erro de função
- ✅ Chat captura mensagens continuamente sem interrupções

### ✅ Verificações

- [x] Testado com mensagens sendo capturadas
- [x] Sem mais erros de "not a function"
- [x] Reconexão automática funciona corretamente
- [x] Compatível com todas as versões do Puppeteer

### 📊 Teste Realizado

```
✓ Mensagem #5: [joseaxrl] goat = great of all time...
✓ Mensagem #6: [garcia.] o cara não usou virgula...
✓ Mensagem #7: [FeeF] Ao inves de givamos pros cara...
✓ Mensagem #8: [willian souza] Dito isso a dublagem...
✓ Mensagem #9: [Gustavo] uai vc falou como se não fosse...
```

**Resultado:** ✅ Funcionando perfeitamente!

---

## [1.0.0] - 2025-10-19

### 🎉 Release Inicial

#### Funcionalidades Core
- ✅ Scraper de chat do YouTube com Puppeteer
- ✅ MutationObserver para captura em tempo real
- ✅ WebSocket opcional para envio de mensagens
- ✅ Deduplicação com Set + Queue LRU
- ✅ Reconexão automática

#### Modos de Operação
- ✅ `npm run test` - Teste simples sem WebSocket
- ✅ `npm run debug` - Modo debug com browser visível
- ✅ `npm start` - Modo completo com WebSocket
- ✅ `npm run server` - Servidor WebSocket

#### Melhorias de Compatibilidade
- ✅ User-Agent realista
- ✅ Headers HTTP extras
- ✅ Múltiplos seletores CSS de fallback
- ✅ Logs detalhados para troubleshooting
- ✅ Suporte a múltiplos formatos de URL do YouTube
- ✅ Modo não-headless para evitar detecção

#### Documentação
- ✅ README.md completo
- ✅ INICIO_RAPIDO.md (guia de 3 minutos)
- ✅ TROUBLESHOOTING.md (resolução de problemas)
- ✅ EXEMPLOS_LIVES.md (como encontrar lives)
- ✅ MELHORIAS.md (explicações técnicas)
- ✅ RESUMO.md (visão geral do sistema)

---

## Próximas Versões (Roadmap)

### [1.1.0] - Planejado
- [ ] Suporte a Puppeteer Cluster (múltiplas lives)
- [ ] Plugin stealth para modo headless confiável
- [ ] Salvamento em banco de dados (SQLite/MongoDB)
- [ ] Filtros de palavras-chave
- [ ] Rate limiting configurável

### [1.2.0] - Planejado
- [ ] API REST para controle remoto
- [ ] Dashboard web em tempo real
- [ ] Estatísticas de mensagens
- [ ] Export para CSV/JSON
- [ ] Integração com Discord/Telegram

### [2.0.0] - Futuro
- [ ] Suporte a Twitch
- [ ] Suporte a Facebook Live
- [ ] Machine Learning para análise de sentimento
- [ ] Clustering de tópicos
- [ ] Moderação automática

---

## Como Reportar Bugs

Se encontrar problemas:

1. Execute `npm run debug` e tire um screenshot
2. Copie os logs completos
3. Verifique se o vídeo está ao vivo
4. Confira se seguiu o guia de troubleshooting
5. Abra uma issue com todas as informações acima

## Como Contribuir

Pull requests são bem-vindos! Para mudanças grandes:

1. Abra uma issue primeiro para discutir
2. Fork o projeto
3. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
4. Commit: `git commit -m 'Adiciona nova funcionalidade'`
5. Push: `git push origin feature/nova-funcionalidade`
6. Abra um Pull Request

---

**Versão atual:** 1.0.1  
**Status:** ✅ Estável e funcionando  
**Puppeteer:** v22.x compatível  
**Node.js:** v18+ recomendado
