var express = require('express');
var app = express();
var path = require('path');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var glob = require('glob');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Request = require('request-promise');

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

    var requestOptions = {
        method: "POST",
        uri: 'http://127.0.0.1:3000/register',
        body: {
            prefix: '/podcasts',
            host: server.address().address || '127.0.0.1',
            port: port
        },
        json: true
    };
    Request(requestOptions)
        .then(resp => console.log(resp))
        .catch(err => console.error('Service could not be registered!'));
});

var gracefulShutdown = function () {
    server.close(deregisterService);

    setTimeout(function killItAnyways() {
        console.error("Could not close connections in time, forcefully shutting down");
        deregisterService()
            .finally(() => process.exit());
    }, 10 * 1000);

    function deregisterService() {
        var requestOptions = {
            method: "POST",
            uri: 'http://127.0.0.1:3000/unregister',
            body: {
                prefix: '/podcasts'
            },
            json: true
        };

        return Request(requestOptions)
            .then(resp => console.log(resp))
            .catch(err => console.error('Service could not be unregistered!'));
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;
