var express = require('express');
var path = require('path');
var app = module.exports = express();
var ServerSocket = require('./socketServer.js');

app.use('/dist', express.static(path.join(__dirname, '/dist')));

app.use('/app', express.static(path.join(__dirname, '/app')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

ServerSocket.config.run();

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});
