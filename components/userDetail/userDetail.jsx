import React from 'react';
import './userDetail.css';

import {
  Link
} from 'react-router-dom';

//import fetchModel from "../../lib/fetchModelData";
import axios from 'axios';
import Button from '@material-ui/core/Button';


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currUser: undefined,
      loggedInUser: this.props.loggedInUser,
    };

    let url = "http://localhost:3000/user/" + this.props.match.params.userId;
    axios.get(url).then((response) => {
        this.setState({currUser: response.data});
        this.props.setDisplay(this.state.currUser.first_name + " " + this.state.currUser.last_name);
    })
    .catch((error)=> {
      console.log(error);
      throw error;
    });

  }

  componentDidUpdate(prevProps){
    if (prevProps.match.params.userId !== this.props.match.params.userId){
    let url = "http://localhost:3000/user/" + this.props.match.params.userId;
    axios.get(url).then((response) => {
      this.setState({currUser: response.data});
      this.props.setDisplay(response.data.first_name + " " + response.data.last_name);
  })
    .catch((error)=>{
      console.log(error);
      throw error;
    })
  }
}

  render() {
    return (
      this.state.currUser ? (
      <div className = "classdetails">
        <h1> {this.state.currUser.first_name} {this.state.currUser.last_name} </h1>
        <div>
          <p>
            <b>☆ Location:</b> {this.state.currUser.location} <br/>
            <b>☆ Description:</b> {this.state.currUser.description} <br/>
            <b>☆ Occupation:</b> {this.state.currUser.occupation}
          </p>
          <Link to={"/photos/" + this.state.currUser._id}> view {this.state.currUser.first_name}&apos;s pics ⇢ </Link>
        </div>
      </div> 
      ) : (<div />)
    );
  }
}

export default UserDetail;
