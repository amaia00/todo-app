/**
 * Created by amaia.nazabal on 6/9/17.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const Backbone = require('backbone');
const BackboneMixin = require('backbone-react-component');

const todoItems = new Backbone.Collection([{id: 1, txt:"créer une structure d'application"},
    {id: 2, txt:"gérer l'affichage de données statiques"}, {id: 3, txt:"gérer des données dynamiques"}]);


class TodoBanner extends React.Component {
    render() {
        return <h3>Quantité: {this.props.qtyTodos}</h3>;
    }
}

class TodoInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {item: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({item: event.target.value});
    }

    handleSubmit(event) {
        this.props.newItems(this.state.item);
        this.setState({item: ''});
        event.preventDefault();
        return false;
    }

    render() {
        return <form onSubmit={this.handleSubmit}>
            <input type="text" onChange={this.handleChange} value={this.state.item}/>
            <input type="submit" value="Add"/>
        </form>
    }
}

class TodoListItem extends React.Component {
    render() {
        return (
            <li>{this.props.item.id + ". " + this.props.item.txt }</li>
        );
    }
}

class TodoList extends React.Component {
    render() {
        const listitem = [];
        for (let i = 0; i < this.props.listetodos.length; i++) {
            listitem.push(<TodoListItem key={this.props.listetodos[i].id} item={this.props.listetodos[i]}/>);
        }

        return <ul>{listitem}</ul>;
    }
}

const TodoApp = React.createClass({
    mixins: [BackboneMixin],

    updateItems: function(newItem) {
        const newItemID = this.state.collection.length + 1;
        this.props.collection.add({id:newItemID, txt:newItem});
    },

    render: function() {
        return <div>
            <TodoBanner qtyTodos={this.state.collection.length}/>
            <TodoList listetodos={this.state.collection}/>
            <TodoInput newItems={this.updateItems}/>
        </div>;
    }
});

ReactDOM.render(<TodoApp name="TodoList" collection={todoItems}/>, document.getElementById('todo'));
