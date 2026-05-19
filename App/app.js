const express        = require('express');
const morgan         = require('morgan');
const cors           = require('cors');
const globalMiddleware = require('../Controller/GlobalMiddlewareErrorHandler');
const mountingRoute  = require('./../Route/index');
const limiter        = require('./../Security/rateLimit');
const hpp            = require('hpp');
const mongoSanitize  = require('express-mongo-sanitize');
const helmet         = require('helmet');

let app = express();

// Security headers
app.use(helmet());

// CORS — allow the React frontend on port 5173
app.use(cors({
  origi: ["https://cloud-kitchen-frontend-beige.vercel.app/"],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '20kb' }));

// Sanitization
app.use(mongoSanitize());

// Logging
app.use(morgan('dev'));

// Rate limiting
app.use('/services', limiter);

// Serve uploaded images as static files
app.use('/uploads', express.static('uploads'));

// Routes
mountingRoute(app);

// Global error handler
app.use(globalMiddleware);

module.exports = app;
