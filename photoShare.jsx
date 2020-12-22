import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from './components/loginRegister/LoginRegister';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDisplay: '',
      isLoggedIn: false,
      loggedInUser: null,
    };
    this.setDisplay = this.setDisplay.bind(this);
    this.isLoggedIn = this.isLoggedIn.bind(this);
    //this.setUserGreeting = this.setUserGreeting.bind(this);
  }

  setDisplay(newDisplay) {
    this.setState({currentDisplay: newDisplay});
  }

  isLoggedIn(newLoginValue, userId){
    this.setState({isLoggedIn: newLoginValue, loggedInUser: userId});
  }

  /*
  setUserGreeting(newGreeting){
    this.setState({currentGreeting: newGreeting});
  }
  */

  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar display = {this.state.currentDisplay} loggedInUser = {this.state.loggedInUser} isLoggedIn = {this.isLoggedIn}/>
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper  className="cs142-main-grid-item">
            {
              this.state.isLoggedIn ?
              <Route path="/users" component={UserList}  />
              :
              <Redirect path = "/users" to = "/login-register"/>
            }
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch> 

            {
              this.state.isLoggedIn ?
              <Redirect path = "/login-register" to = {"/users/" + this.state.loggedInUser._id}/> :
              <Route path = "/login-register" render = { props => <LoginRegister setDisplay = {this.setDisplay} isLoggedIn = {this.isLoggedIn} {...props} /> } /> 
            }

            {
              this.state.isLoggedIn ?
              <Route exact path="/"
                render={() =>
                  <Typography variant="body1">
                  Welcome to Polaroid®, a photo sharing app! (the first of its kind... Instagram who lol)
                  Click on a user to the left to get stalking! ☺︎
                  </Typography>}
              /> 
              : 
                <Redirect path = "/" to = "/login-register"/>
            }

            {
              this.state.isLoggedIn ?
              <Route path="/users/:userId"
                render={ props => <UserDetail setDisplay = {this.setDisplay} loggedInUser = {this.state.loggedInUser} isLoggedIn = {this.isLoggedIn}{...props} /> }
              />
              :
              <Redirect path = "/users/:userId" to = "/login-register"/>
            }

            {
              this.state.isLoggedIn ?
              <Route path="/photos/:userId"
                render ={ props => <UserPhotos setDisplay = {this.setDisplay} {...props} /> }
              />
              :
              <Redirect path = "/photos/:userId" to = "/login-register"/>
            }
            {
              this.state.isLoggedIn ?
              <Route path="/users" component={UserList}  />
              :
              <Redirect path = "/users" to = "/login-register"/>
            }
    
            <Route path = "/login-register" render = { props => <LoginRegister setDisplay = {this.setDisplay} isLoggedIn = {this.isLoggedIn} {...props} /> } /> 

            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
    </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
