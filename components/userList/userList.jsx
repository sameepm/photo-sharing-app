import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
}

from '@material-ui/core';
import './userList.css';

import {
  Link
} from 'react-router-dom';

//import fetchModel from "../../lib/fetchModelData";
import axios from 'axios';



/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userList: undefined,
    };

    axios.get("http://localhost:3000/user/list").then((response) => {
        this.setState({userList: response.data});
    })
    .catch((error) =>{
        console.log(error);
        throw error;
    });
  }

  renderRow(){
    var users = [];

    for (var i = 0; i < this.state.userList.length; i++){
      var currUser = this.state.userList[i];
      var currName = currUser.first_name + " " + currUser.last_name;
      var userId = "/users/" + currUser._id;
      users[i] = 
        <div key = {i}>
        <ListItem button key={i} component = {Link} to={userId}>
        <ListItemText primary= {currName}/>
        </ListItem>
        <Divider/>
        </div>
    }

    var retVal =
       <div>
        <List className = "list">
          {users}
        </List>
        </div>
      return retVal;
    }


  render() {
    return (
      this.state.userList ? (
      <div>
        {this.renderRow()}
      </div>) : (<div />)
    );
  }
}

export default UserList;
