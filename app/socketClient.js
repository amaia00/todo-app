/**
 * Created by amaia.nazabal on 6/10/17.
 */
// TODO add port to config
const wssUrl = "ws://localhost:3002";

var socket;
var EVENT = EVENT || {};

const cmd = {
    get: '/getAllTask ',
    add: '/addTask ',
    update: '/updateTask ',
    remove: '/removeTask ',
    disconnect: '/disconnect ',
    broadcast: '/broadcast '
};

let SocketClient = {

    socket: null,
    tasks: [],

    init: function(){

        socket = new WebSocket(wssUrl);

        socket.onopen = function(){
            socket.send(cmd.get);
        };

        socket.onmessage = function (evt) {
            let cmd;
            let param = evt.data;
            if(evt.data.indexOf('/') === 0){
                cmd = evt.data.split(' ')[0];
                param = evt.data.replace(cmd, '');
            }
            EVENT.loadTasks.trigger('load', param);
        };

        socket.onclose = function() {
            console.debug("Connection fermé.")
        };
    },

    sendAddTask: function(msg){
        socket.send(cmd.add + JSON.stringify(msg));
    },

    sendUpdateTask: function(msg){
        socket.send(cmd.update + JSON.stringify(msg));
    },

    sendRemoveTask: function(msg){
        socket.send(cmd.remove + JSON.stringify(msg));
    },

    getAllTasks: function(){
        try{ socket.send(cmd.get); }
        catch (e) {}
    },

    close: function(){
        socket.close();
    }
};

