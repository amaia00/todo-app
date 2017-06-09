var express = require('express');
var app = module.exports = express();
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
app.listen(3000, function () {
    console.log('App listening on port 3000!');
});
