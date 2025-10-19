'use strict';

const puppeteer = require('puppeteer');
const WebSocket = require('ws');

const DEFAULT_CONFIG = {
  chatUrlBase: 'https://www.youtube.com/live_chat?v=',
  wsEndpoint: 'ws://localhost:3000',
  headlessMode: 'new',
  browserArgs: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  navigationTimeoutMs: 30000,
  reconnectDelayMs: 10000,
  wsReconnectDelayMs: 5000,
  dedupeCacheSize: 1000,
  debug: false
};

const createLogger = (scope) => {
  return (...args) => console.info(`[${scope}]`, ...args);
};

const normalizeVideoId = (input) => {
  if (!input) {
    return '';
  }

  const raw = String(input).trim();
  if (!raw) {
    return '';
  }

  if (!/^https?:\/\//i.test(raw)) {
    return raw;
  }

  try {
    const url = new URL(raw);

    const paramId = url.searchParams.get('v');
    if (paramId) {
      return paramId;
    }

    if (url.hostname === 'youtu.be') {
      return url.pathname.replace(/^\/+/, '');
    }

    const liveMatch = url.pathname.match(/\/live\/([^/?]+)/);
    if (liveMatch && liveMatch[1]) {
      return liveMatch[1];
    }
  } catch (_) {
    return raw;
  }

  return raw;
};

async function startChatScraper(videoId, options = {}) {
  const resolvedVideoId = normalizeVideoId(videoId);

  if (!resolvedVideoId) {
    throw new Error('Um VIDEO_ID valido e obrigatorio.');
  }

  const config = { ...DEFAULT_CONFIG, ...options };
  const log = createLogger('scraper');
  const wsLog = createLogger('ws');
  const useWebSocket = Boolean(config.wsEndpoint);

  let browser;
  let page;
  let reconnectTimeout;
  let wsReconnectTimeout;
  let stopping = false;

  const processedIds = new Set();
  const processedQueue = [];
  const messageQueue = [];

  let wsClient = null;

  const rememberId = (id) => {
    processedIds.add(id);
    processedQueue.push(id);
    if (processedQueue.length > config.dedupeCacheSize) {
      const oldest = processedQueue.shift();
      processedIds.delete(oldest);
    }
  };

  const flushPendingMessages = () => {
    if (!useWebSocket) {
      return;
    }
    if (!wsClient || wsClient.readyState !== WebSocket.OPEN) {
      return;
    }
    while (messageQueue.length > 0) {
      const payload = messageQueue.shift();
      try {
        wsClient.send(JSON.stringify(payload));
      } catch (error) {
        wsLog('Falha ao enviar mensagem pelo WebSocket:', error.message);
        messageQueue.unshift(payload);
        break;
      }
    }
  };

  const handleOutgoingMessage = (payload) => {
    const key = payload.id || `${payload.author}|${payload.text}|${payload.capturedAt}`;
    if (processedIds.has(key)) {
      return;
    }
    rememberId(key);

    const printable = `[${payload.author}] ${payload.text}`;
    console.log(printable);

    if (!useWebSocket) {
      return;
    }

    if (!wsClient || wsClient.readyState !== WebSocket.OPEN) {
      messageQueue.push(payload);
      return;
    }

    try {
      wsClient.send(JSON.stringify(payload));
    } catch (error) {
      wsLog('Erro ao enviar mensagem em tempo real, adicionando a fila:', error.message);
      messageQueue.push(payload);
    }
  };

  const connectWebSocket = () => {
    if (!useWebSocket) {
      wsLog('WebSocket desativado. Mensagens serao apenas exibidas no console.');
      return;
    }

    if (wsClient) {
      wsClient.removeAllListeners();
      wsClient.terminate();
    }

    wsClient = new WebSocket(config.wsEndpoint);

    wsClient.on('open', () => {
      wsLog('Conectado.');
      flushPendingMessages();
    });

    wsClient.on('error', (error) => {
      wsLog('Erro na conexao:', error.message);
    });

    wsClient.on('close', (code, reason) => {
      if (stopping) {
        return;
      }
      wsLog(`Conexao encerrada (code=${code} reason="${reason}"). Tentando novamente em ${config.wsReconnectDelayMs}ms.`);
      clearTimeout(wsReconnectTimeout);
      wsReconnectTimeout = setTimeout(connectWebSocket, config.wsReconnectDelayMs);
    });
  };

  const cleanBrowser = async () => {
    if (page && !page.isClosed()) {
      try {
        await page.close();
      } catch (error) {
        log('Falha ao fechar a pagina:', error.message);
      }
    }
    page = null;

    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        log('Falha ao fechar o browser:', error.message);
      }
    }
    browser = null;
  };

  const scheduleRestart = (reason) => {
    if (stopping) {
      return;
    }
    log(`Reiniciando em ${config.reconnectDelayMs}ms (${reason}).`);
    clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(() => {
      spawnBrowser().catch((error) => {
        log('Nao foi possivel reiniciar o Puppeteer:', error.message);
        scheduleRestart('erro ao reiniciar');
      });
    }, config.reconnectDelayMs);
  };

  const injectObserver = async () => {
    if (!page) {
      return;
    }

    try {
      await page.evaluate(() => {
        if (window.__chatObserverInjected) {
          return;
        }
        window.__chatObserverInjected = true;

        const seen = new Set();

        const normalizeText = (element) => {
          if (!element) {
            return '';
          }
          
          // Tenta pegar texto diretamente
          let text = element.textContent || element.innerText || '';
          
          // Se não funcionar, tenta com TreeWalker
          if (!text.trim()) {
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
            const parts = [];
            while (walker.nextNode()) {
              const nodeText = walker.currentNode.textContent || '';
              if (nodeText.trim()) {
                parts.push(nodeText);
              }
            }
            text = parts.join(' ');
          }
          
          return text.replace(/\s+/g, ' ').trim();
        };

        const emitMessage = (renderNode) => {
          if (!renderNode || renderNode.nodeType !== Node.ELEMENT_NODE) {
            return;
          }

          const messageId = renderNode.getAttribute('id') || renderNode.dataset?.id || `msg-${Date.now()}-${Math.random()}`;
          if (seen.has(messageId)) {
            return;
          }
          seen.add(messageId);

          // Tenta múltiplos seletores para author
          let author = '';
          const authorSelectors = [
            '#author-name',
            'yt-live-chat-author-chip #author-name',
            '.yt-live-chat-author-chip__author-name',
            '[id="author-name"]'
          ];
          
          for (const selector of authorSelectors) {
            const authorEl = renderNode.querySelector(selector);
            if (authorEl) {
              author = normalizeText(authorEl);
              if (author) break;
            }
          }
          
          if (!author) {
            author = 'Desconhecido';
          }

          // Tenta múltiplos seletores para message
          let text = '';
          const messageSelectors = [
            '#message',
            'yt-live-chat-text-message-renderer #message',
            '.yt-live-chat-text-message-renderer__message',
            '[id="message"]'
          ];
          
          for (const selector of messageSelectors) {
            const messageEl = renderNode.querySelector(selector);
            if (messageEl) {
              text = normalizeText(messageEl);
              if (text) break;
            }
          }
          
          if (!text) {
            return;
          }

          const timestampEl = renderNode.querySelector('#timestamp');
          const timestampText = timestampEl ? normalizeText(timestampEl) : '';

          window.onChatMessage?.({
            id: messageId,
            author,
            text,
            timestampText,
            capturedAt: Date.now()
          });
        };

        const processNode = (node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }
          if (node.matches?.('yt-live-chat-text-message-renderer')) {
            emitMessage(node);
            return;
          }
          const nested = node.querySelectorAll?.('yt-live-chat-text-message-renderer');
          nested?.forEach(emitMessage);
        };

        const tryObserve = () => {
          // Tenta múltiplos seletores para encontrar o container
          const containerSelectors = [
            'yt-live-chat-item-list-renderer #items',
            '#items.yt-live-chat-item-list-renderer',
            'yt-live-chat-item-list-renderer',
            '#chat #items',
            '#chat-messages'
          ];
          
          let container = null;
          for (const selector of containerSelectors) {
            container = document.querySelector(selector);
            if (container) {
              console.log(`[Observer] Container encontrado com seletor: ${selector}`);
              break;
            }
          }
          
          if (!container) {
            console.log('[Observer] Container não encontrado, tentando novamente...');
            console.log('[Observer] HTML disponível:', document.body ? 'sim' : 'não');
            console.log('[Observer] Elementos yt-live-chat:', document.querySelectorAll('[id*="chat"]').length);
            setTimeout(tryObserve, 1000);
            return;
          }

          console.log('[Observer] Container encontrado, iniciando observação...');

          // Processa mensagens existentes
          const existingMessages = container.querySelectorAll('yt-live-chat-text-message-renderer');
          console.log(`[Observer] ${existingMessages.length} mensagens existentes encontradas`);
          existingMessages.forEach(emitMessage);

          const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              mutation.addedNodes.forEach(processNode);
            }
          });

          observer.observe(container, { childList: true, subtree: true });
          console.log('[Observer] MutationObserver ativo');

          window.addEventListener(
            'yt-page-data-updated',
            () => {
              console.log('[Observer] Página atualizada, reiniciando observer...');
              observer.disconnect();
              window.__chatObserverInjected = false;
              setTimeout(tryObserve, 0);
            },
            { once: true }
          );
        };

        tryObserve();
      });
    } catch (error) {
      log('Falha ao injetar MutationObserver:', error.message);
      scheduleRestart('erro ao injetar observer');
    }
  };

  const spawnBrowser = async () => {
    await cleanBrowser();

    log('Iniciando browser...');
    browser = await puppeteer.launch({
      headless: config.headlessMode,
      args: config.browserArgs
    });

    const targetPage = await browser.newPage();
    page = targetPage;
    page.setDefaultNavigationTimeout(config.navigationTimeoutMs);

    // Configura User-Agent realista para evitar detecção de bot
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Define headers extras
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    });

    page.on('close', () => scheduleRestart('aba fechada'));
    page.on('error', (error) => scheduleRestart(`erro na pagina: ${error.message}`));
    browser.once('disconnected', () => scheduleRestart('browser desconectado'));

    // Habilita logs do console da página
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[Observer]') || config.debug) {
        log(text);
      }
    });

    await page.exposeFunction('onChatMessage', (payload) => {
      handleOutgoingMessage(payload);
    });

    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        injectObserver().catch((error) => log('Falha ao reinjetar observer:', error.message));
      }
    });

    const chatUrl = `${config.chatUrlBase}${resolvedVideoId}`;

    try {
      log(`Navegando para: ${chatUrl}`);
      await page.goto(chatUrl, { waitUntil: 'networkidle2', timeout: config.navigationTimeoutMs });
      
      // Aguarda um pouco para o YouTube carregar completamente
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (config.debug) {
        await page.screenshot({ path: 'debug-chat.png' });
        log('Screenshot salvo em debug-chat.png');
      }
      
      // Verifica se é página de erro
      const pageTitle = await page.title();
      log(`Título da página: ${pageTitle}`);
      
      if (pageTitle.toLowerCase().includes('error') || pageTitle.toLowerCase().includes('not available')) {
        throw new Error(`Página de erro detectada: ${pageTitle}`);
      }
      
      // Scroll para garantir que o conteúdo carregue
      await page.evaluate(() => {
        window.scrollBy(0, 100);
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Tenta encontrar o container com seletores alternativos
      const selectors = [
        'yt-live-chat-item-list-renderer',
        'yt-live-chat-renderer',
        '#chat-messages',
        '#items.yt-live-chat-item-list-renderer',
        'yt-live-chat-app'
      ];
      
      let containerFound = false;
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          log(`✓ Container encontrado: ${selector}`);
          containerFound = true;
          break;
        } catch (e) {
          log(`✗ Container não encontrado: ${selector}`);
        }
      }
      
      if (!containerFound) {
        // Tenta verificar o HTML da página para debug
        const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
        log('Início do HTML da página:', bodyHTML);
        throw new Error('Nenhum container de chat encontrado. O chat pode estar desabilitado ou o vídeo não está ao vivo.');
      }
      
      await injectObserver();
      log(`✓ Monitorando chat: ${chatUrl}`);
    } catch (error) {
      log('Falha ao carregar o chat:', error.message);
      
      if (config.debug && page) {
        try {
          await page.screenshot({ path: 'debug-error.png' });
          log('Screenshot de erro salvo em debug-error.png');
        } catch (e) {}
      }
      
      scheduleRestart('erro ao carregar chat');
    }
  };

  connectWebSocket();
  await spawnBrowser();

  return {
    stop: async () => {
      stopping = true;
      clearTimeout(reconnectTimeout);
      clearTimeout(wsReconnectTimeout);
      await cleanBrowser();
      if (wsClient) {
        wsClient.removeAllListeners();
        wsClient.close();
      }
    }
  };
}

module.exports = {
  startChatScraper
};
