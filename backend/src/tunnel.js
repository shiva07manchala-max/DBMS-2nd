const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 5000 });
    console.log('======================================================');
    console.log('🌍 PUBLIC INTERNET URL (SHAREABLE WITH ANY LAPTOP):');
    console.log(tunnel.url);
    console.log('======================================================');

    tunnel.on('close', () => {
      console.log('Tunnel connection closed');
    });
  } catch (err) {
    console.error('Tunnel error:', err);
  }
})();
