require('dotenv').config();
const http = require('http');
const createApp = require('./app');
const { initSocket } = require('./sockets');

const PORT = process.env.PORT || 4000;

const app = createApp();
const httpServer = http.createServer(app);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

initSocket(httpServer, allowedOrigins.length ? allowedOrigins : '*');

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Hotel Menu API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled rejection:', err);
});
