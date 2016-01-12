var express = require('express');
var app = express();
var path = require('path');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var glob = require('glob');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Config = require('./services/configService');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());
app.use('/_views', express.static(path.join(__dirname, 'public')));

glob.sync('./routes/**/*.js').forEach(route => {
  app.use('/', require(route)(io));
});


var server = http.listen(Config.get('server:port'), function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server listening at http://%s:%s', host, port);
});

module.exports = server;
