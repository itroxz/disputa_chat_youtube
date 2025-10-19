'use strict';

const { startChatScraper } = require('./chatScraper');

const testVideoId = process.argv[2] || '1xaLqhic_6Q';

console.log('=== TESTE HEADLESS (Sem Browser Visível) ===');
console.log(`Video ID: ${testVideoId}`);
console.log(`Chat URL: https://www.youtube.com/live_chat?v=${testVideoId}`);
console.log('WebSocket: Desabilitado');
console.log('Headless: SIM (browser invisível)');
console.log('============================================\n');

(async () => {
  let messageCount = 0;
  
  try {
    const controller = await startChatScraper(testVideoId, {
      wsEndpoint: null,
      headlessMode: 'new', // Modo headless verdadeiro
      debug: false
    });

    console.log('✓ Scraper iniciado em modo headless!');
    console.log('Aguardando mensagens do chat...');
    console.log('(Se funcionar, você verá mensagens sem o browser aparecer)\n');

    // Contador de mensagens
    const originalLog = console.log;
    console.log = function(...args) {
      const msg = args.join(' ');
      if (msg.startsWith('[') && !msg.includes('[scraper]') && !msg.includes('[ws]') && !msg.includes('[Observer]')) {
        messageCount++;
        originalLog(`\x1b[32m✓\x1b[0m Mensagem #${messageCount}:`, ...args);
      } else {
        originalLog(...args);
      }
    };

    // Timer para mostrar status
    let noMessageTimer = setTimeout(() => {
      if (messageCount === 0) {
        console.warn('\n⚠️  Nenhuma mensagem em 30 segundos em modo headless.');
        console.warn('O YouTube pode estar detectando automação.');
        console.warn('\nOpções:');
        console.warn('  1. Use npm run test (modo não-headless)');
        console.warn('  2. Instale puppeteer-extra-plugin-stealth');
        console.warn('  3. Use outro VIDEO_ID\n');
      } else {
        console.info(`\n✅ Modo headless FUNCIONANDO! ${messageCount} mensagens capturadas.`);
      }
    }, 30000);

    const shutdown = async () => {
      clearTimeout(noMessageTimer);
      console.log(`\n\n📊 Total de mensagens capturadas: ${messageCount}`);
      if (messageCount > 0) {
        console.log('🎉 Modo headless funcionou perfeitamente!');
      }
      console.log('Encerrando...');
      await controller.stop();
      console.log('✓ Finalizado.');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('\n✗ Erro:', error.message);
    process.exit(1);
  }
})();
