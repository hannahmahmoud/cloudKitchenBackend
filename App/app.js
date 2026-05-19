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

const corsOptions = {
  origin: [
    'https://cloud-kitchen-frontend-beige.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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