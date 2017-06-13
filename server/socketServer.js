/**
 * Created by amaia.nazabal on 6/10/17.
 */


var exports = module.exports = {};

var WebSocketServer = require('ws').Server;
exports.wss = new WebSocketServer({host: '0.0.0.0', port: 3002});
exports.OPEN = 1;
exports.ID_TASKS = 0;

exports.config = {
    tasks: [],
    users: [],
    run: function () {
        exports.wss.on('connection', function (ws) {
            ws.on('message', function (message) {
                console.log("reveived: " + message);
                exports.config.dispatch(ws, message);
            });

            ws.on('close', function () {
                exports.config.tasks.remove();
                exports.config.tasksList();
            });
        });
    },

    dispatch: function (ws, message) {
        try {


            var cmd = '';
            var param = '';

            if (message.indexOf('/') === 0) {
                cmd = message.split(' ')[0];
                param = message.replace(cmd, '');
            }

            var msg;
            switch (cmd) {
                case '/addTask':
                    msg = param.replace(' ', '');
                    if (msg !== '') {
                        exports.config.addTask(ws, msg);
                    }
                    break;
                case '/updateTask':
                    msg = param.replace(' ', '');
                    if (msg !== '') {
                        exports.config.updateTask(ws, msg);
                    }
                    break;
                case '/removeTask':
                    msg = param.replace(' ', '');
                    if (msg !== '') {
                        exports.config.removeTask(ws, msg);
                    }
                    break;
                case '/addUser':
                    msg = param.replace(' ', '');
                    if (msg !== '') {
                        exports.config.addUser(ws, msg);
                    }
                    break;

                case '/removeUser':
                    msg = param.replace(' ', '');
                    if (msg !== '') {
                        exports.config.removeUser(ws, msg);
                    }
                    break;

                case '/getAllTask':
                    exports.config.tasksList();
                    break;

                case '/getAllUser':
                    exports.config.userList();
                    break;
                default:
                    break;
            }

        } catch (e) {
            this.broadcastCommand("/error " + e.message);
        }
    },

    addTask: function (ws, item) {
        item = JSON.parse(item);
        item.id = exports.ID_TASKS + 1;
        exports.ID_TASKS++;
        exports.config.tasks.push(item);
        exports.config.tasksList();
    },

    addUser: function (ws, user) {
        user = JSON.parse(user);
        var userCount = this.users.filter(function (item) {
            return item.name === user.name;
        });

        if (typeof userCount === 'undefined' || userCount.length === 0) {
            exports.config.users.push(user);
        }

        exports.config.userList();
    },

    updateTask: function (ws, task) {
        task = JSON.parse(task);
        this.tasks.find(function (item) {
            return item.id === task.id;
        }).completed = true;

        exports.config.tasksList();
    },

    removeTask: function (ws, task) {
        task = JSON.parse(task);
        this.tasks = this.tasks.filter(function (item) {
            return item.id !== task.id;
        });
        exports.config.tasksList();
    },

    removeUser: function (ws, user) {
        user = JSON.parse(user);
        var userTasks = this.tasks.find(function (item) {
            return item.user === user.name;
        });
        if (typeof userTasks === "undefined" || userTasks.length === 0)
            this.users = this.users.filter(function (item) {
                return item.name !== user.name;
            });

        exports.config.userList();
    },

    tasksList: function () {
        exports.config.broadcastCommand('/tasksList ' + JSON.stringify(this.tasks));
    },

    userList: function () {
        exports.config.broadcastCommand('/usersList ' + JSON.stringify(this.users));
    },

    broadcastCommand: function (cmd) {
        exports.wss.clients.forEach(function (client) {
            if (client.readyState === exports.OPEN) {
                client.send(cmd);
            }
        });
    },
};
