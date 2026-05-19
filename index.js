const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const dns      = require('dns');

dotenv.config({ path: 'config.env' });
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = require('./App/app');

mongoose.connect(process.env.CONN_STR).catch((err) => {
  console.log('MongoDB connection error: ' + err);
});

module.exports = app;