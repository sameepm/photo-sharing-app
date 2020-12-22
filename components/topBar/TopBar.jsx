import React from 'react';
import {
  AppBar, Toolbar, Typography, Grid, Button,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

import './TopBar.css';

//import fetchModel from "../../lib/fetchModelData";
import axios from 'axios';


/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);

    this.state ={
        version: "",
        display: this.props.display,
        loggedInUser: null,
        uploadedphoto: false,
    };
    this.handleLogout = this.handleLogout.bind(this);
    this.uploadPhoto = this.uploadPhoto.bind(this);
    this.fileInput = React.createRef();

    var url = "http://localhost:3000/test/info";
    axios.get(url).then((response) => {
        this.setState({version: response.data.__v});
      })
    .catch((error) =>{
        console.log(error);
        throw error;
    });
  }

  componentDidUpdate(prevProps){
    if (prevProps.display !== this.props.display){
      this.setState({display: this.props.display})
    }
    if(prevProps.loggedInUser !== this.props.loggedInUser){
      this.setState({loggedInUser: this.props.loggedInUser})
    }
  }

  handleLogout(){
    axios.post("http://localhost:3000/admin/logout")
    .then(()=>{
      this.setState({
        loggedInUser: null,
      });
      this.props.isLoggedIn(false, null);
    })
    .catch((err) =>{
      console.log(err);
      throw err;
    });
  }

  deleteUser(){
  let url = "http://localhost:300/deleteUser/"
  let body = loggedInUser._id

  axios.post(url, body)
    .then(()=>{
      this.setState({
        loggedInUser: null,
      });
      this.props.isLoggedIn(false, null);
    })
    .catch((err) =>{
      console.log(err);
      throw err;
    });
}

  uploadPhoto(e) {
    e.preventDefault();
    if (this.fileInput.current.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append("uploadedphoto", this.fileInput.current.files[0]);
      axios
        .post("/photos/new", domForm)
        .then((res) => {
          this.setState({uploadedphoto: true})
          console.log(res);
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  }


  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
        {this.state.uploadedphoto && (
          <Alert variant="standard" severity = "success" onClose={event =>this.setState({uploadedphoto: false})}>
          Photo Published!
      </Alert>
        )}

        <Grid container direction = "row" justify = "space-between" alignItems = "center">
          <Typography variant="h5" color="inherit">
              Sam Mangat ✿
          </Typography>
           <Typography variant="h5" color="inherit">
              {this.state.loggedInUser !== null ? "hello " + this.state.loggedInUser.first_name + "!" : "v." + this.state.version}
          </Typography>
          {this.state.loggedInUser !== null && (
            <Button 
            variant = "contained" color = "default" onClick = {(e) => this.handleLogout(e)}
            >
               Logout
            </Button>
            )}
          {this.state.loggedInUser !== null && (
            <Button 
            variant = "contained" color = "default" onClick = {(e) => this.deleteUser(e)}
            >
               Delete Acc
            </Button>
            )}

          {this.state.loggedInUser !== null && (
            <form onSubmit={this.uploadPhoto}>
            <input type="file" accept="images/*" ref={this.fileInput}/>
            <button type="submit">Submit</button>
            </form>
            )}
          <Typography variant="h5" color="inherit">
              {this.state.display}
          </Typography>

          </Grid>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
