/**
 * Created by amaia.nazabal on 6/10/17.
 */
// TODO addTask port to config
const wssUrl = "ws://localhost:3002";

var socket;
var EVENT = EVENT || {};

const cmd = {
    getTasks: '/getAllTask ',
    addTask: '/addTask ',
    updateTask: '/updateTask ',
    removeTask: '/removeTask ',
    getUsers: '/getAllUser ',
    addUser: '/addUser ',
    removeUser: '/removeUser ',
    disconnect: '/disconnect ',
    broadcast: '/broadcast '
};

let SocketClient = {

    socket: null,
    tasks: [],

    init: function() {

        socket = new WebSocket(wssUrl);

        socket.onopen = function(){
            socket.send(cmd.getTasks);
        };

        socket.onmessage = function (evt) {
            let cmd;
            let param = evt.data;
            if(evt.data.indexOf('/') === 0){
                cmd = evt.data.split(' ')[0];
                param = evt.data.replace(cmd, '');
            }

            if (cmd === '/tasksList') {
                EVENT.reload.trigger('tasks', param);
                SocketClient.getAllUsers();
            }else if (cmd === '/usersList') {
                EVENT.reload.trigger('users', param);
            }
        };

        socket.onclose = function() {
            console.debug("Connection fermé.")
        };
    },

    sendAddTask: function(msg){
        socket.send(cmd.addTask + JSON.stringify(msg));
    },

    sendAddUser: function(msg){
        socket.send(cmd.addUser + JSON.stringify(msg));
    },

    sendUpdateTask: function(msg){
        socket.send(cmd.updateTask + JSON.stringify(msg));
    },

    sendRemoveTask: function(msg){
        socket.send(cmd.removeTask + JSON.stringify(msg));
    },

    sendRemoveUser: function (msg) {
        socket.send(cmd.removeUser + JSON.stringify(msg));
    },

    getAllTasks: function() {
        try {
            socket.send(cmd.getTasks);
        } catch (e) {
            console.debug("Error websocket msg: getAllTasks: " + e.message);
        }
    },
    
    getAllUsers: function () {
        try {
            socket.send(cmd.getUsers);
        } catch (e) {
            console.debug("Error websocket msg: getAllUser: " + e.message);
        }
    },

    close: function(){
        socket.close();
    }
};

