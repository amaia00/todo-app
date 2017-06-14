/**
 * Created by amaia.nazabal on 6/9/17.
 */

var React = require('react');
var ReactDOM = require('react-dom');
var Backbone = require('backbone');
var backboneMixin = require('backbone-react-component');
var underscore = require('underscore');
var classNames = require('classnames');
var ReactBootstrap = require('react-bootstrap');
var apps = apps || {};


apps.ALL_TODOS = 'all';
apps.ACTIVE_TODOS = 'active';
apps.COMPLETED_TODOS = 'completed';

/**
 * dlon = lon2 - lon1
 dlat = lat2 - lat1
 a = (sin(dlat/2))^2 + cos(lat1) * cos(lat2) * (sin(dlon/2))^2
 c = 2 * atan2( sqrt(a), sqrt(1-a) )
 d = R * c (where R is the radius of the Earth)
 */

EVENT.reload = underscore.extend({}, Backbone.Events);

const taskModel = Backbone.Model.extend({
    defaults: {
        id: '',
        task: '',
        user: '',
        completed: false,
        lon: '',
        lat: '',
        rappel: ''
    },
    idAttribute: 'id',
    url: '/test'
});

const userModel = Backbone.Model.extend({
    defaults: {
        name: ''
    },
    idAttribute: 'name',
    url: '/test'
});

const todoItems = new Backbone.Collection({
    model: taskModel,
    comparator: 'id',
    url: '/test'

});

const users = new Backbone.Collection({
    model: userModel,
    comparator: 'name',
    url: '/test'
});
users.set([]);

/*var onSuccess = function(position) {
 console.log('Latitude: '          + position.coords.latitude          + '\n' +
 'Longitude: '         + position.coords.longitude         + '\n' +
 'Altitude: '          + position.coords.altitude          + '\n' +
 'Accuracy: '          + position.coords.accuracy          + '\n' +
 'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
 'Heading: '           + position.coords.heading           + '\n' +
 'Speed: '             + position.coords.speed             + '\n' +
 'Timestamp: '         + position.timestamp                + '\n');
 };

 function onError(error) {
 console.log('code: '    + error.code    + '\n' +
 'message: ' + error.message + '\n');
 }

 navigator.geolocation.getCurrentPosition(onSuccess, onError, { maximumAge: 3000, timeout: 60000, enableHighAccuracy: true });*/

// onSuccess Callback
//   This method accepts a `Position` object, which contains
//   the current GPS coordinates
//

function onSuccess(position) {
    console.debug("onSuccess:");
    var info = [];
    info.push(position.coords.latitude);
    info.push(position.coords.longitude);
    console.debug("onSuccess: checkCloseTask --> ", position.coords.latitude, position.coords.longitude);
    SocketClient.checkCloseTask(position.coords.latitude, position.coords.longitude);

    return info;
}

// onError Callback receives a PositionError object
//
function onError(error) {
    console.debug('Error: code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
}

// Options: throw an error if no update is received every 1 seconds.
/* TODO add parameter */
var watchID = navigator.geolocation.watchPosition(onSuccess, onError, {timeout: 10000, enableHighAccuracy: true});
var ACTUAL_POSITION = {};

var getGeoCoordinates = function (addresse, rappel, useActualPosition, callback) {
    var add = {lat: '', long: ''};
    if (rappel && !useActualPosition) {
        var getGeocoder = new google.maps.Geocoder();

        getGeocoder.geocode({'address': addresse}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    console.debug("lot lang resultant --> ", results[0]);
                    var latitude = results[0].geometry.location.lat();
                    var longitude = results[0].geometry.location.lng();
                    add['lat'] = latitude;
                    add['long'] = longitude;

                    console.debug("add for callback --> ", add);
                    callback(add);
                }
                else {
                    navigator.notification.alert('Unable to detect your coordinates.');
                    add['lat'] = 0;
                    add['long'] = 0;

                    add['lat'] = 0;
                    add['long'] = 0;
                    callback(add);
                }
            }
            else {
                add['lat'] = 0;
                add['long'] = 0;
                callback(add);
            }
        });
    } else if (rappel && useActualPosition) {
        console.log("OKOKOKOKOK");
        add['lat'] = ACTUAL_POSITION.lat;
        add['long'] = ACTUAL_POSITION.long;
        console.log("ADDD HERE", JSON.stringify(add));
        callback(add);
    }

};


class TodoBanner extends React.Component {
    render() {
        return <div className="row">
            <div className="col-lg-12">
                <h4> Tâches : {this.props.qtyTodos}</h4>
            </div>
            <hr/>
        </div>;
    }
}

class UseActualPosition extends React.Component {
    render() {
        return (
            <ReactBootstrap.FormGroup>
                <ReactBootstrap.Checkbox name="checkPosition" inline onChange={this.props.onChange}>
                    Voulez vous qu'on utilise votre position actuelle pour assigner à la tâche
                </ReactBootstrap.Checkbox>
            </ReactBootstrap.FormGroup>)
    }
}

class Rappel extends React.Component {
    render() {
        return (
            <ReactBootstrap.FormGroup>
                <ReactBootstrap.Checkbox name="radioGroup" inline onChange={this.props.onChange}>
                    Voulez vous etre rappelé lorsque vous serez proche de la tache
                </ReactBootstrap.Checkbox>
                {' '}
            </ReactBootstrap.FormGroup>
        )
    }
}
/*
 *
 *
 navigator.geolocation.getCurrentPosition(function (position) {
 self.setState({usePosition: {lat: position.coords.latitude,
 long: position.coords.longitude}});
 }, function (error) {
 console.debug("ERROR: -> " + error);
 }, { maximumAge: 3000, timeout: 60000,
 enableHighAccuracy: true });
 */
var getCurrentPosition = navigator.geolocation.getCurrentPosition(function (position) {
    ACTUAL_POSITION = {
        lat: position.coords.latitude,
        long: position.coords.longitude
    };
    console.log("ACTUAL POSITION: -> ", ACTUAL_POSITION.lat, ACTUAL_POSITION.long);
}, function (error) {
    console.debug("ERROR: -> " + error);
}, {
    maximumAge: 3000, timeout: 60000, enableHighAccuracy: true
});

class TodoInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {item: '', personne: '', adresse: '', rappel: false, useActualPosition: false};

        this.disabledAddress = false;
        this.handleTaskChange = this.handleTaskChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleAdresseChange = this.handleAdresseChange.bind(this);
        this.handleRappelChange = this.handleRappelChange.bind(this);
        this.handleUsePositionChange = this.handleUsePositionChange.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleTaskChange(event) {
        this.setState({item: event.target.value});
    }

    handleUserChange(event) {
        this.setState({personne: event.target.value});
    }

    handleAdresseChange(event) {
        this.setState({adresse: event.target.value});
    }

    handleRappelChange(event) {
        this.setState({rappel: event.target.checked});
    }

    handleUsePositionChange(event) {
        this.setState({useActualPosition: event.target.checked});
        console.log("handleUsePositionChange ->" , event.target.value);
        if (event.target.value)
            this.disabledAddress = true;
        else
            disabledAddress = false;
        getCurrentPosition();
    }

    handleSubmit(event) {
        if (this.state.item.length === 0 || this.state.personne.length === 0) {
            event.preventDefault();
            return false;
        } else {
            event.preventDefault();

            console.log("addItem TODOINPUT-> ", this.state.item, this.state.personne, this.state.adresse,
                this.state.rappel, this.state.useActualPosition);

            this.props.addItem(this.state.item, this.state.personne, this.state.adresse, this.state.rappel,
                this.state.useActualPosition);

            this.setState({item: '', personne: '', adresse: ''});

            this.focusInput();
            return false;
        }
    }

    focusInput() {
        this.textInput.focus();
    }

    render() {
        return (
            <div className="jumbotron formulaire">
                <form onSubmit={this.handleSubmit}>
                    <div className="row">
                        <div className="col-lg-offset-2 col-lg-8 col-md-offset-3 col-md-6 col-xs-offset-0 col-xs-12">
                            <div className="form-group">
                                <div className="input-group">
                                <span className="input-group-addon" key="basic-addon1"><span
                                    className="glyphicon glyphicon-tasks" aria-hidden="true"/></span>
                                    <input type="text" className="form-control" aria-describedby="basic-addon1"
                                           placeholder="Entrer une nouvele tâche" autoFocus="autoFocus"
                                           onChange={this.handleTaskChange} value={this.state.item}
                                           ref={(input) => {
                                               this.textInput = input;
                                           }}/>
                                </div>
                                <div className="input-group">
                                <span className="input-group-addon" key="basic-addon2"><span
                                    className="glyphicon glyphicon-user" aria-hidden="true"/></span>
                                    <input type="text" className="form-control" aria-describedby="basic-addon2"
                                           placeholder="Entrer un nom pour assigner cette tache"
                                           onChange={this.handleUserChange} value={this.state.personne}
                                           disabled={this.disabledAddress}
                                    />

                                </div>

                                <div className="input-group">
                                <span className="input-group-addon" key="basic-addon3"><span
                                    className="glyphicon glyphicon-user" aria-hidden="true"/></span>
                                    <input type="text" className="form-control" aria-describedby="basic-addon3"
                                           placeholder="Entrer un ad pour assigner cette tache"
                                           onChange={this.handleAdresseChange} value={this.state.adresse}
                                    />
                                </div>
                            </div>
                        </div>
                        <UseActualPosition onChange={this.handleUsePositionChange}/>
                        <Rappel onChange={this.handleRappelChange}/>
                        <br/>
                        <div className=" col-md-offset-4 col-md-4 col-xs-offset-2 col-xs-8">
                            <button type="submit" className="btn btn-primary btn-block btn_custom shape-1  effect-4">
                                <span className="glyphicon glyphicon-plus-sign" aria-hidden="true"/>Ajouter une tâche
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}


class TaskAction extends React.Component {

    updateItem() {
        this.props.updateItem(this.props.index);
    }

    removeItem() {
        this.props.removeItem(this.props.index);
    }

    getButton() {
        if (!this.props.completed) {
            return (
                <button type="button" onClick={() => this.updateItem()}
                        className="btn btn-xs btn-success">
                    <i className="glyphicon glyphicon-ok"></i>
                </button>
            )
        }
    }

    render() {
        return (
            <div className="btn-group btn-group-xs pull-right" role="group">
                {this.getButton()}
                <button type="button" onClick={() => this.removeItem()}
                        className="btn btn-xs btn-danger">
                    <i className="glyphicon glyphicon-remove"></i>
                </button>
            </div>
        )
    }
}

class TodoListItem extends React.Component {
    render() {
        let cssClass = 'list-group-item list-group-item-';

        if (this.props.item.completed)
            cssClass += 'success';
        else
            cssClass += 'info';

        return (
            <li key={this.props.item.id}
                className={cssClass}>
                Tâche {this.props.item.id + " : " + this.props.item.task }<span><b> assignée à </b> {this.props.item.user}</span>
                <TaskAction
                    index={this.props.item.id}
                    completed={this.props.item.completed}
                    updateItem={this.props.updateItem}
                    removeItem={this.props.removeItem}/>
            </li>
        );
    }
}

class Footer_Filtered extends React.Component {
    render() {
        const listuser = [];
        for (let i = 0; i < this.props.users.length; i++) {
            listuser.push(<ReactBootstrap.MenuItem className="listes_users" key={i + this.props.users[i].name}
                                                   eventKey={i}
                                                   href={"#/" + this.props.special + "user/" + this.props.users[i].name}>{this.props.users[i].name}</ReactBootstrap.MenuItem>);
        }
        return <div> {listuser}</div>
    }
}


class Footer extends React.Component {
    render() {
        return (
            <div className="filter"><ReactBootstrap.ButtonToolbar
                className={classNames({selected: this.props.nowShowing === apps.ALL_TODOS})} key="list1">
                <ReactBootstrap.DropdownButton bsSize="large" title=" All" key="list_user" id="dropdown-size-large">
                    <ReactBootstrap.MenuItem value="all" key="All" eventKey="All"
                                             href="#/">all</ReactBootstrap.MenuItem>
                    <Footer_Filtered special="" users={this.props.users}/>
                </ReactBootstrap.DropdownButton>

            </ReactBootstrap.ButtonToolbar>
                <ReactBootstrap.ButtonToolbar key="list2"
                                              className={classNames({selected: this.props.nowShowing === apps.ACTIVE_TODOS})}>
                    <ReactBootstrap.DropdownButton bsSize="large" title="Active" key="list_user"
                                                   id="dropdown-size-large">
                        <ReactBootstrap.MenuItem key="Active" value="active" eventKey="Active"
                                                 href="#/active">all</ReactBootstrap.MenuItem>
                        <Footer_Filtered special="active/" users={this.props.users}/>
                    </ReactBootstrap.DropdownButton>

                </ReactBootstrap.ButtonToolbar><ReactBootstrap.ButtonToolbar key="list3"
                                                                             className={classNames({selected: this.props.nowShowing === apps.COMPLETED_TODOS})}>
                    <ReactBootstrap.DropdownButton bsSize="large" title=" Completed" key="list_user"
                                                   id="dropdown-size-large">
                        <ReactBootstrap.MenuItem key="Completed" value="completed" eventKey="Completed"
                                                 href="#/completed">all</ReactBootstrap.MenuItem>
                        <Footer_Filtered special="completed/" users={this.props.users}/>
                    </ReactBootstrap.DropdownButton>
                </ReactBootstrap.ButtonToolbar>
            </div>
        );
    }
}

class Message extends React.Component {
    constructor() {
        super();
        //this.state = {msg: this.props.msg};
    }

    render() {
        if (this.props.message.length !== 0)
            return <p className="text-info">{this.props.message}</p>
        else
            return <p/>
    }
}

class TodoList extends React.Component {
    constructor() {
        super();
        this.state = {
            nowShowing: null,
            nowShowingsuser: null,
        };
    }

    render() {
        const nowShowing = this.props.nowShowing;
        const nowShowingsuser = this.props.nowShowingsuser;
        const props = this.props;

        if (nowShowing !== undefined && nowShowingsuser !== undefined) {
            const shownTodos = this.props.listetodos.filter(function (listetodos) {

                switch (nowShowing) {
                    case apps.ACTIVE_TODOS:
                        if (nowShowingsuser === listetodos.user) {
                            return !listetodos.completed && listetodos.user === nowShowingsuser;
                        } else if (nowShowingsuser === undefined || nowShowingsuser === apps.ALL_TODOS) {
                            return !listetodos.completed;
                        }

                        return false;

                    case apps.COMPLETED_TODOS:
                        if (nowShowingsuser === listetodos.user)
                            return listetodos.completed && listetodos.user === nowShowingsuser;
                        else if (nowShowingsuser === undefined || nowShowingsuser === apps.ALL_TODOS)
                            return listetodos.completed;

                        return false;

                    default:
                        if (nowShowingsuser === listetodos.user)
                            return listetodos.user === nowShowingsuser;
                        else
                            return (nowShowingsuser === undefined || nowShowingsuser === apps.ALL_TODOS);
                }
            });

            const todotems = shownTodos.map(function (listetodos) {

                const listitem = [];
                listitem.push(<TodoListItem key={listetodos.id} item={listetodos}
                                            updateItem={props.updateItem}
                                            removeItem={props.removeItem}/>);

                return (
                    listitem
                )
            });

            return (
                <ul className=" list_todo list-group" key='list'>
                    <Footer nowShowing={this.state.nowShowing} users={this.props.users}/>{todotems}
                </ul>
            );
        }
        return <h1/>
    }
}
class HeaderMeu extends React.Component {
    render() {

        return (
            <ReactBootstrap.Navbar inverse collapseOnSelect className="navbar-fixed-top">
                <ReactBootstrap.Navbar.Header>
                    <ReactBootstrap.Navbar.Brand>
                        <a href="#">Todo Mobile</a>
                    </ReactBootstrap.Navbar.Brand>
                    <ReactBootstrap.Navbar.Toggle />
                </ReactBootstrap.Navbar.Header>
                <ReactBootstrap.Navbar.Collapse>
                    <ReactBootstrap.Nav>
                        <ReactBootstrap.NavDropdown eventKey={3} title="All" id="basic-nav-dropdown">
                            <ReactBootstrap.MenuItem value="all" key="All" eventKey="All"
                                                     href="#">ALL</ReactBootstrap.MenuItem>
                            <Footer_Filtered special="" users={this.props.users}/>
                        </ReactBootstrap.NavDropdown>
                        <ReactBootstrap.NavDropdown eventKey={3} title="Active" id="basic-nav-dropdown1">
                            <ReactBootstrap.MenuItem value="active" key="active" eventKey="acrtive"
                                                     href="#/active">ALL</ReactBootstrap.MenuItem>
                            <Footer_Filtered special="active/" users={this.props.users}/>
                        </ReactBootstrap.NavDropdown>
                        <ReactBootstrap.NavDropdown eventKey={3} title="Completed" id="basic-nav-dropdown2">
                            <ReactBootstrap.MenuItem value="completed" key="completed" eventKey="completed"
                                                     href="#/completed">ALL</ReactBootstrap.MenuItem>
                            <Footer_Filtered special="completed/" users={this.props.users}/>
                        </ReactBootstrap.NavDropdown>
                    </ReactBootstrap.Nav>
                </ReactBootstrap.Navbar.Collapse>
            </ReactBootstrap.Navbar>

        );

    }


}

const TodoApp = React.createClass({
    mixins: [backboneMixin],

    componentWillMount: function () {
        this.setState({'users': this.props.users, 'msg': ''});
        EVENT.reload.on('tasks', this.loadItems, this);
        EVENT.reload.on('users', this.loadUsers, this);
        EVENT.reload.on('close-tasks', this.tasksClose, this);
    },

    tasksClose: function (obj) {
        obj = JSON.parse(obj);

        if (obj.close) {
            this.setState({msg: "Le tâche " + obj.id + " est proche."});
            navigator.vibrate(1000);
            console.log("tache close detecte!");
        }
    },

    componentDidMount: function () {
        this.socket = SocketClient;
        this.socket.init();
        SocketClient.getAllTasks();
    },

    loadItems: function (tasks) {
        tasks = JSON.parse(tasks);
        this.setState({'collection': tasks});
    },

    loadUsers: function (users) {
        this.setState({users: JSON.parse(users)});
    },

    addItem: function (task, user, address, rappel, useActualPosition) {
        var self = this;
        console.log("addItem TODOAPP --> ", task, user, address, rappel, useActualPosition);
        this.setState({msg: ''});

        getGeoCoordinates(address, rappel, useActualPosition, function (adresses) {
            console.debug("INFO send to add TASK socket ");
            self.socket.sendAddTask({
                task: task,
                completed: false,
                user: user,
                long: adresses.long || null,
                lat: adresses.lat || null,
                rappel: rappel
            });
            console.debug("INFO send to add USER socket ");
            self.socket.sendAddUser({name: user});
        });
    },

    updateItem: function (id) {
        this.setState({msg: ''});
        this.socket.sendUpdateTask({id: id});
    },

    removeItem: function (idTask) {
        this.setState({msg: ''});
        const item = this.state.collection.filter(function (item) {
            return item.id === idTask;
        })[0];
        this.socket.sendRemoveTask({id: idTask});
        this.socket.sendRemoveUser({name: item.user});
    },

    render: function () {
        return <div><img className="image_class" src="/images/todo-list.jpg"/>
            <HeaderMeu users={this.state.users}/>
            <TodoBanner qtyTodos={this.state.collection.length}/>
            <TodoInput addItem={this.addItem}/>
            <Message message={this.state.msg}/>
            <TodoList nowShowing={this.state.nowShowing} nowShowingsuser={this.state.nowShowingsuser}
                      listetodos={this.state.collection} updateItem={this.updateItem}
                      removeItem={this.removeItem} users={this.state.users}/>
        </div>;
    }
});

const react = ReactDOM.render(<TodoApp name="todo-app" collection={todoItems} users={users.models}/>,
    document.getElementById('todo'));
const Router = Backbone.Router.extend({

    routes: {
        '': 'all',
        'active': 'active',
        'completed': 'completed',
        'user/:param': 'user',
        'active/user/:param': 'active_user',
        'completed/user/:param': 'completed_user',
    },

    all: function () {
        react.setState({nowShowingsuser: apps.ALL_TODOS});
        react.setState({nowShowing: apps.ALL_TODOS});
    },

    active: function () {
        react.setState({nowShowing: apps.ACTIVE_TODOS});
        react.setState({nowShowingsuser: apps.ALL_TODOS});
    },

    completed: function () {
        react.setState({nowShowing: apps.COMPLETED_TODOS});
        react.setState({nowShowingsuser: apps.ALL_TODOS});

    },

    user: function (param) {
        if (typeof param !== 'undefined' && param !== null) {
            react.setState({nowShowingsuser: param});
        }
    },

    active_user: function (param) {
        react.setState({nowShowing: apps.ACTIVE_TODOS});
        react.setState({nowShowingsuser: param});
    },

    completed_user: function (param) {
        react.setState({nowShowing: apps.COMPLETED_TODOS});
        react.setState({nowShowingsuser: param});
    }
});

const router = new Router();
Backbone.history.start();