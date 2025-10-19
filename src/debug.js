'use strict';

const { startChatScraper } = require('./chatScraper');

// Teste com debug habilitado
const testVideoId = process.argv[2] || '1xaLqhic_6Q';

console.log('=== TESTE COM DEBUG ===');
console.log(`Video ID: ${testVideoId}`);
console.log('Debug: ATIVADO');
console.log('Screenshots serão salvos na raiz do projeto');
console.log('=======================\n');

(async () => {
  try {
    const controller = await startChatScraper(testVideoId, {
      wsEndpoint: null, // Desabilita WebSocket
      debug: true,      // Ativa modo debug
      headlessMode: false // Mostra o browser
    });

    console.log('\n✓ Scraper iniciado!');
    console.log('Você pode ver o browser aberto para debug.');
    console.log('Pressione CTRL+C para encerrar.\n');

    const shutdown = async () => {
      console.log('\nEncerrando...');
      await controller.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('✗ Erro:', error);
    process.exit(1);
  }
})();
