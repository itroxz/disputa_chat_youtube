'use strict';

const dotenv = require('dotenv');
const { startChatScraper } = require('./chatScraper');

dotenv.config();

const videoId = process.env.VIDEO_ID || process.argv[2];
const rawWsEndpoint = process.env.WS_ENDPOINT;
const headlessMode = process.env.HEADLESS_MODE || 'new'; // 'new', 'false', ou deixe vazio para padrão

const scraperOptions = {
  headlessMode: headlessMode === 'false' ? false : headlessMode
};

if (typeof rawWsEndpoint === 'string') {
  const trimmed = rawWsEndpoint.trim();
  if (trimmed === '') {
    scraperOptions.wsEndpoint = null;
  } else {
    scraperOptions.wsEndpoint = trimmed;
  }
}

(async () => {
  try {
    if (!videoId) {
      console.error('Defina a variavel VIDEO_ID no .env ou informe via argumento de linha de comando.');
      process.exit(1);
    }

    const controller = await startChatScraper(videoId, scraperOptions);
    console.info('Scraper iniciado. Pressione CTRL+C para encerrar.');

    const shutdown = async () => {
      console.info('\nEncerrando...');
      await controller.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Erro ao iniciar o scraper:', error);
    process.exit(1);
  }
})();
