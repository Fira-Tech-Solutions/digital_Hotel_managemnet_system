const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images to load from other subdomains
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, mobile) and configured origins
        if (!origin || allowedOrigins.length === 0) {
          callback(null, true);
        } else {
          // Check full match or hostname-only match (e.g. "localhost:3000" matches "http://localhost:3000")
          const hostname = origin.replace(/^https?:\/\//, '');
          const isAllowed = allowedOrigins.some(o => o === origin || o === hostname);
          if (isAllowed) {
            callback(null, true);
          } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
          }
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate limit order submission + login specifically to prevent abuse
  const strictLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
  app.use('/api/public/orders', strictLimiter);
  app.use('/api/admin/auth/login', strictLimiter);

  // Serve uploaded images statically
  app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

  app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

  // Consumed by the guest menu app + public marketing website (no auth)
  app.use('/api/public', publicRoutes);

  // Consumed only by the admin panel (JWT auth required)
  app.use('/api/admin', adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
