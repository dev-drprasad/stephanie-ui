const app = require('./app');

module.exports.main = require('express-on-serverless')(app);
