'use strict';
const express = require('express');
const app = express();
const path = require('path');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const glob = require('glob');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const Request = require('request-promise');

const Config = require('./services/configService');
const serviceSecret = fs.readFileSync('./.pid', 'utf8');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());
app.use('/_views', express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

glob.sync('./routes/**/*.js').forEach(route => {
    app.use('/', require(route)(io));
});

const server = http.listen(Config.get('server:port'), function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);

    let requestOptions = {
        method: "POST",
        uri: 'http://127.0.0.1:3000/register',
        json: true
    };

    if(serviceSecret) {
        requestOptions.body = {
            secret: serviceSecret
        };
    } else {
        requestOptions.body = {
            prefix: '/podcasts',
            host: host || '127.0.0.1',
            port: port
        };
    }

    Request(requestOptions)
        .then(resp => fs.writeFileSync('./.pid', resp, 'utf8'))
        .catch(err => console.error('Service could not be registered!', err.error));
});

function gracefulShutdown() {
    console.log('gracefulShutdown');

    deregisterService()
        .then(() => server.close());

    setTimeout(function killItAnyways() {
        console.error("Could not close connections in time, forcefully shutting down");
        deregisterService()
            .finally(() => process.exit());
    }, 10 * 1000);

    function deregisterService() {
        console.log('deregisterService', server.serviceSecret);

        let requestOptions = {
            method: "POST",
            uri: 'http://127.0.0.1:3000/unregister',
            body: {
                secret: serviceSecret
            },
            json: true
        };

        return Request(requestOptions)
            .then(resp => console.log(resp))
            .catch(err => console.error('Service could not be unregistered!'));
    }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;
