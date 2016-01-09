var express = require('express');
var path = require('path');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var glob = require('glob');

var Config = require('./services/configService');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());

glob.sync('./routes/**/*.js').forEach(route => {
  app.use('/', require(route));
});

var server = app.listen(Config.get('server:port'), function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server listening at http://%s:%s', host, port);
});

module.exports = server;
