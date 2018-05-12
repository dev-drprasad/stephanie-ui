const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');

const binaryMimeTypes = ['image/jpeg', 'image/png'];
const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);

exports.main = (event, context) =>
  awsServerlessExpress.proxy(server, event, context);
