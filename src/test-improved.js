'use strict';

const { startChatScraper } = require('./chatScraper');

const testVideoId = process.argv[2] || '1xaLqhic_6Q';

console.log('=== TESTE MELHORADO DO SCRAPER ===');
console.log(`Video ID: ${testVideoId}`);
console.log(`Chat URL: https://www.youtube.com/live_chat?v=${testVideoId}`);
console.log('WebSocket: Desabilitado');
console.log('Headless: Não (browser minimizado - igual ao debug)');
console.log('===================================\n');

(async () => {
  let messageCount = 0;
  
  try {
    const controller = await startChatScraper(testVideoId, {
      wsEndpoint: null,
      headlessMode: false, // Usa modo não-headless como o debug
      debug: false
    });

    console.log('✓ Scraper iniciado!');
    console.log('Aguardando mensagens do chat...');
    console.log('(Se nenhuma mensagem aparecer em 30s, o vídeo pode não estar ao vivo)\n');

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
        console.warn('\n⚠️  Nenhuma mensagem recebida em 30 segundos.');
        console.warn('Possíveis causas:');
        console.warn('  1. O vídeo não está AO VIVO');
        console.warn('  2. O chat está desabilitado');
        console.warn('  3. Ninguém está enviando mensagens');
        console.warn('\nTente:');
        console.warn('  - npm run debug (para ver o browser)');
        console.warn('  - Usar outro VIDEO_ID de uma live ativa\n');
      }
    }, 30000);

    const shutdown = async () => {
      clearTimeout(noMessageTimer);
      console.log(`\n\n📊 Total de mensagens capturadas: ${messageCount}`);
      console.log('Encerrando...');
      await controller.stop();
      console.log('✓ Finalizado.');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('\n✗ Erro ao iniciar:', error.message);
    console.error('\nTente: npm run debug');
    process.exit(1);
  }
})();
