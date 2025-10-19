'use strict';

const { startChatScraper } = require('./chatScraper');

// Desabilita WebSocket para teste simples
const testVideoId = process.argv[2] || '1xaLqhic_6Q';

console.log('=== TESTE DO SCRAPER ===');
console.log(`Video ID: ${testVideoId}`);
console.log('WebSocket: Desabilitado (teste local)');
console.log('========================\n');

(async () => {
  try {
    const controller = await startChatScraper(testVideoId, {
      wsEndpoint: null // Desabilita WebSocket para teste
    });

    console.log('\n✓ Scraper iniciado com sucesso!');
    console.log('Aguardando mensagens do chat...\n');
    console.log('Pressione CTRL+C para encerrar.\n');

    const shutdown = async () => {
      console.log('\n\nEncerrando teste...');
      await controller.stop();
      console.log('✓ Teste finalizado.');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('✗ Erro ao iniciar o scraper:', error);
    process.exit(1);
  }
})();
