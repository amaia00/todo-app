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


EVENT.loadTasks = underscore.extend({}, Backbone.Events);

const model = Backbone.Model.extend({
    defaults: {
        id: '',
        task: '',
        user: '',
        completed: false
    },
    idAttribute: 'id',
    url: '/test'
});

const todoItems = new Backbone.Collection({
    model: model,
    comparator: 'id',
    url: '/test'

});
/*todoItems.set([{id: 1, task: "créer une structure d'application", completed: false , user:'sofia'},
    {id: 2, task: "gérer l'affichage de données statiques", completed: true, user:'amaia'}, {id: 3, task: "gérer des données dynamiques", completed:false, user:'sofia'}]);
*/
const addAlluser = function(todoItem) {
    var list_user = [];

    todoItem.forEach(function (item) {
        if (!list_user.includes(item.attributes.user)) {
            list_user.push(item.attributes.user);
        }
    });

    return list_user;
};

var list_user = [];

const counterUser = function (collection) {
    var array_counter = [];

    collection.each(function(col) {

        if(Object.keys(array_counter).includes(col.attributes.user)) {
            array_counter[col.attributes.user]++

        }
        else {
            array_counter[col.attributes.user]=1;
        }
    });
    return array_counter;
};
const removeUser = function (arr, item) {
        for(var i = arr.length; i--;) {
            if(arr[i] === item) {
                arr.splice(i, 1);
            }
        }
    };



class TodoBanner extends React.Component {
    render() {
        return <div className="row">
            <div className="col-lg-12">
                <h4> Tâches : {this.props.qtyTodos}</h4>
            </div><hr/>
        </div>;
    }
}

class TodoInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {item: '',personne:''};

        this.handleChange = this.handleChange.bind(this);
        this.ChangePersonne = this.ChangePersonne.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({item: event.target.value});
    }
    ChangePersonne(event) {
        this.setState({personne: event.target.value});
    }

    handleSubmit(event) {
        if(this.state.item.length==0 || this.state.personne.length==0 ) {
            event.preventDefault();
            return false;
            console.log("remplir les champs");
        }
        else {
            event.preventDefault();
            this.props.addItem(this.state.item, this.state.personne);
            //this.props.addPersonne(this.state.personne);
            this.setState({item: ''});
            this.setState({personne: ''});
            this.focusInput();
            return false;

        }



    }

    focusInput() {
        this.textInput.focus();
    }

    render() {
        return <div className="jumbotron formulaire">
            <form onSubmit={this.handleSubmit}>
                <div className="row">
                    <div className="col-lg-offset-2 col-lg-8 col-md-offset-3 col-md-6 col-xs-offset-0 col-xs-12">
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" key="basic-addon1"><span className="glyphicon glyphicon-tasks" aria-hidden="true"></span></span>
                                <input type="text" className="form-control" aria-describedby="basic-addon1" placeholder="Entrer une nouvele tâche"
                                       onChange={this.handleChange} value={this.state.item}
                                       ref={(input) => {
                                           this.textInput = input;
                                       }}/>
                            </div>
                            <div className="input-group">
                                <span className="input-group-addon" key="basic-addon2"><span className="glyphicon glyphicon-user" aria-hidden="true"></span></span>
                                <input type="text" className="form-control" aria-describedby="basic-addon2" placeholder="Entrer un nom pour assigner cette tache"
                                       onChange={this.ChangePersonne} value={this.state.personne}
                                       ref={(inputpersonne) => {
                                           this.textInput = inputpersonne;
                                       }}/>
                            </div>
                        </div>
                    </div>
                    <br/>
                    <div className=" col-md-offset-4 col-md-4 col-xs-offset-2 col-xs-8">
                        <button type="submit" className="btn btn-primary btn-block btn_custom shape-1  effect-4" >
                            <span className="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>Ajouter une tâche</button>
                    </div>
                </div>
            </form>
        </div>
    }
}

class TodoListItem extends React.Component {
    render() {
        let cssClass = 'list-group-item list-group-item-';

        if (this.props.item.completed) cssClass += 'success';
        else cssClass += 'info';

        return (
            <li key={this.props.item.id}
                className = {cssClass}>Tâche {this.props.item.id + " : " + this.props.item.task }<span><b> assignée à </b> {this.props.item.user}</span>
                <TaskAction
                    index={this.props.item.id}
                    completed={this.props.item.completed}
                    updateItem={this.props.updateItem}
                    removeItem={this.props.removeItem} />
            </li>
        );
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
                <button type="button" onClick={(e) => this.updateItem(e)}
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
                <button type="button" onClick={(e) => this.removeItem(e)}
                        className="btn btn-xs btn-danger">
                    <i className="glyphicon glyphicon-remove"></i>
                </button>
            </div>
        )
    }
}

class TodoList extends React.Component{
    constructor() {
        super();
        this.state = {
            nowShowing: null,
            nowShowingsuser:null,
        };
    }



    render() {
        var nowShowing = this.props.nowShowing;
        var nowShowingsuser = this.props.nowShowingsuser;
        var props = this.props;
        console.log("1/",nowShowing);
        console.log("2/",this.state.nowShowing);

        if(nowShowing!=undefined && nowShowingsuser!=undefined ) {

            var shownTodos = this.props.listetodos.filter(function (listetodos) {

                switch (nowShowing) {


                    case apps.ACTIVE_TODOS:
                        if(nowShowingsuser ==listetodos.user) {
                            return !listetodos.completed && listetodos.user==nowShowingsuser;
                        }
                        else if(nowShowingsuser == undefined || nowShowingsuser == apps.ALL_TODOS){


                            return !listetodos.completed && true;


                        }else{

                            return !listetodos.completed && false;

                        }
                    case apps.COMPLETED_TODOS:
                        if(nowShowingsuser ==listetodos.user) {

                            return listetodos.completed && listetodos.user==nowShowingsuser;
                        }
                        else if(nowShowingsuser == undefined || nowShowingsuser == apps.ALL_TODOS){


                            return listetodos.completed && true;


                        }else{


                            return listetodos.completed && false;

                        }
                    default:
                        if(nowShowingsuser ==listetodos.user) {

                            return listetodos.user==nowShowingsuser;
                        }
                        else if(nowShowingsuser == undefined || nowShowingsuser == apps.ALL_TODOS){


                            return true;


                        }else{


                            return false;

                        }
                }

            });
            var todotems = shownTodos.map(function (listetodos) {

                let listitem = [];
                listitem.push(<TodoListItem key={listetodos.id} item={listetodos}
                                            updateItem={props.updateItem}
                                            removeItem={props.removeItem}/>);


                return (
                    listitem
                )


            });
            return <ul className=" list_todo list-group" key='list'> <Footer  nowShowing ={this.state.nowShowing}/>{todotems}</ul>;


        }
        return <h1></h1>


    }



}
class Footer extends React.Component {


    render() {

        return (
            <div className="filter"><ReactBootstrap.ButtonToolbar className={classNames({selected: this.props.nowShowing === apps.ALL_TODOS})} key="list1">
                <ReactBootstrap.DropdownButton bsSize="large" title=" All"  key ="list_user" id="dropdown-size-large">
                    <ReactBootstrap.MenuItem  value="all" key="All" eventKey="All" href="/#/">all</ReactBootstrap.MenuItem>
                 <Footer_Filtered special="" list_user={list_user}  />
                </ReactBootstrap.DropdownButton>

            </ReactBootstrap.ButtonToolbar>
                <ReactBootstrap.ButtonToolbar key="list2" className={classNames({selected: this.props.nowShowing === apps.ACTIVE_TODOS})} >
                    <ReactBootstrap.DropdownButton bsSize="large" title="Active"  key ="list_user" id="dropdown-size-large" >
                        <ReactBootstrap.MenuItem key="Active"  value ="active" eventKey="Active"  href="/#/active">all</ReactBootstrap.MenuItem>
                        <Footer_Filtered special="active/"  list_user={list_user}  />
                    </ReactBootstrap.DropdownButton>

                </ReactBootstrap.ButtonToolbar><ReactBootstrap.ButtonToolbar key="list3" className={classNames({selected: this.props.nowShowing === apps.COMPLETED_TODOS})}>
                    <ReactBootstrap.DropdownButton bsSize="large"  title=" Completed"  key ="list_user" id="dropdown-size-large">
                        <ReactBootstrap.MenuItem key="Completed"  value="completed"  eventKey="Completed" href="/#/completed">all</ReactBootstrap.MenuItem>
                        <Footer_Filtered special="completed/" list_user={list_user}  />
                    </ReactBootstrap.DropdownButton>

                </ReactBootstrap.ButtonToolbar></div>


        );

    }
}
class Footer_Filtered extends React.Component {



    render() {

        var listuser = [];
        for (var i = 0; i < this.props.list_user.length; i++) {
            listuser.push(<ReactBootstrap.MenuItem  className ="listes_users"key={i+this.props.list_user[i]} eventKey={i} href={"/#/"+this.props.special+"user/"+this.props.list_user[i]}>{this.props.list_user[i]}</ReactBootstrap.MenuItem>);

        }
        return (

                <div>
                    {listuser}</div>

        );
    }

}


const TodoApp = React.createClass({


    mixins: [backboneMixin],

    getInitialState: function (props) {
        EVENT.loadTasks.on('load', this.loadItems, this);
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
    addItem: function (newItem, personne) {
        this.socket.sendAddTask({task: newItem, completed:false, user:personne});
    },


    /*addPersonne: function(personne) {
        console.log("add personne",this.props);
        if(this.props.listuser == undefined) {
            let newIDPersonne =  1;
            this.props.listuser.push( personne);
        }
        else {
            if(!this.props.listuser.includes(personne)) {
                let newIDPersonne = this.props.list_user + 1;
                this.props.listuser.push(personne);
            }
        }
    },
*/

    updateItem: function (id) {
        this.socket.sendUpdateTask({id: id});
    },

    removeItem: function (id) {
        this.socket.sendRemoveTask({id: id});
    },
    /*removeItem: function (id) {
        let item = this.props.collection.findWhere({id: id});
        var getusercollection = counterUser(this.props.collection);
        var user = item.attributes.user;
        var getuser = getusercollection[user];
        if(getuser==1) {
            removeUser(this.props.listuser,user)

        }

        this.props.collection.remove(item);
    },*/

    render: function () {
        return <div><img className="image_class"src="/images/todo-list.jpg" />
            <TodoBanner qtyTodos={this.state.collection.length} />
            <TodoInput addItem={this.addItem} addPersonne={this.addPersonne} />
            <TodoList  nowShowing = {this.state.nowShowing} nowShowingsuser={this.state.nowShowingsuser} listetodos={this.state.collection} updateItem={this.updateItem}
                       removeItem={this.removeItem} />


        </div>;
    }
});


var react = ReactDOM.render(<TodoApp name="TodoList" collection={todoItems} listuser = {list_user} />, document.getElementById('todo'));
const Router = Backbone.Router.extend({

    routes: {
        '': 'all',
        'active': 'active',
        'completed': 'completed',
        'user/:param': 'user',
        'active/user/:param': 'active_user',
        'completed/user/:param': 'completed_user',

    },
    all: function(){

        react.setState({nowShowingsuser: apps.ALL_TODOS});
        react.setState({nowShowing: apps.ALL_TODOS});

    },
    active : function() {
        react.setState({nowShowing: apps.ACTIVE_TODOS});
        react.setState({nowShowingsuser: apps.ALL_TODOS});
    },
    completed: function(){
        react.setState( {nowShowing: apps.COMPLETED_TODOS});
        react.setState({nowShowingsuser: apps.ALL_TODOS});

    },
    user: function(param) {

        if (typeof param !== 'undefined' && param !== null)
        {
            react.setState({nowShowingsuser: param});
        }
    },

    active_user : function(param) {
        react.setState({nowShowing: apps.ACTIVE_TODOS});
        react.setState({nowShowingsuser: param});
    },
    completed_user: function(param){
        react.setState( {nowShowing: apps.COMPLETED_TODOS});
        react.setState({nowShowingsuser: param});

    },




});
var  router = new Router();
Backbone.history.start();