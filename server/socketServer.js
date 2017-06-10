/**
 * Created by amaia.nazabal on 6/10/17.
 */


var exports = module.exports = {};

var WebSocketServer = require('ws').Server;
exports.wss = new WebSocketServer({host:'0.0.0.0',port: 8080});
exports.OPEN = 1;

exports.config = {
    tasks: [],
    run: function() {
        exports.wss.on('connection', function (ws) {
            ws.on('message', function(message) {
                console.log('received: %s', message);
                exports.config.dispatch(ws, message);
            });

            ws.on('close', function() {
                exports.config.tasks.remove();
                exports.config.tasksList();
            });
        });
    },

    dispatch: function(ws, message) {
        var cmd = '';
        var param = '';

        if(message.indexOf('/') === 0){
            cmd = message.split(' ')[0];
            param = message.replace(cmd, '');
        }

        var msg;
        switch(cmd){
            case '/broadcast':
                exports.config.broadcast(param, ws);
                break;
            case '/addTask':
                msg = param.replace(' ','');
                if(msg !== ''){
                    exports.config.addTask(ws, msg);
                }
                break;
            case '/updateTask':
                msg = param.replace(' ','');
                if(msg !== ''){
                    exports.config.updateTask(ws, msg);
                }
                break;
            case '/removeTask':
                msg = param.replace(' ','');
                if(msg !== ''){
                    exports.config.removeTask(ws, msg);
                }
                break;
            default:
                break;
        }
    },
    addTask: function(ws, client) {
        exports.config.tasks.push(JSON.parse(client));
        exports.config.tasksList();
    },

    updateTask: function(ws, task) {
        task = JSON.parse(task);
        this.tasks.find(function (item) {
            return item.id === task.id;
        }).completed = true;

        exports.config.tasksList();
    },

    removeTask: function(ws, task) {
        task = JSON.parse(task);
        this.tasks = this.tasks.filter(function (item) {
            return item.id !== task.id;
        });
        exports.config.tasksList();
    },

    tasksList: function() {
        exports.config.broadcastCommand('/tasksList '+ JSON.stringify(this.tasks));
    },

    broadcastCommand: function(cmd){
        exports.wss.clients.forEach(function (client) {
            if (client.readyState === exports.OPEN) {
                client.send(cmd);
            }
        });
    },
};
