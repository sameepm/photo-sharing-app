import React from 'react';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import axios from 'axios';
import Alert from '@material-ui/lab/Alert';


class LoginRegister extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			login: true,
			username: "",
			password: "",
			firstName: "",
			lastName: "",
			location: "",
			description: "",
			occupation: "",
			reenterPassword: "",
			error: false,
		};

		this.props.setDisplay("Please login!");
		this.handleLoginToggle = this.handleLoginToggle.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}


	handleLoginToggle() {
		this.setState(state => ({
			login: !this.state.login,
		}));
	}

	handleSubmit(event){
		event.preventDefault();
		var url;
		event.stopPropagation();
		var body;
		if(this.state.login){
			url = "http://localhost:3000/admin/login";
			body = {
				login_name: this.state.username,
				password: this.state.password,
			};
		}
		else{
			url = "http://localhost:3000/user";
			body = {
				login_name: this.state.username,
				password: this.state.password,
				first_name: this.state.firstName,
				last_name: this.state.lastName,
				location: this.state.location,
				occupation: this.state.occupation,
				description: this.state.description,
			};
		}
		axios.post(url, body)
		.then((response)=>{
			this.setState({
				username: "",
				password: "",
				firstName: "",
				lastName: "",
				location: "",
				description: "",
				occupation: "",
				reenterPassword: "",

			});
			this.props.isLoggedIn(true, response.data);
		})
		.catch((error)=>{
			if (this.state.login && error.response.status === 400){
				this.setState({
					username: "",
					password: "",
					error: true,
				});
			}
			if (!this.state.login && error.response.status === 400){
				this.setState({
					username: "",
					error: true,
				});
			}
		});

	}

	render(){ 
		return (
			<div>
			{this.state.error && this.state.login &&(
			<Alert variant="standard" severity = "error" onClose={event =>this.setState({error: false})}>
				Username or password incorrect. Try again!
			</Alert>)}
			{this.state.error && !this.state.login &&(
			<Alert variant="standard" severity = "error" onClose={event =>this.setState({error: false})}>
				Username is already taken. Try a different one!
			</Alert>)}
			{this.state.login && (
				<Container component="main" maxWidth="xs">
        <CssBaseline />
        <div>
        <Avatar>
        <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
        Sign in
        </Typography>
        <form onSubmit = {this.handleSubmit}>
          <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          type="username"
          value = {this.state.username}
          onChange ={event =>this.setState({username: event.target.value})}
          error = {this.state.username === ""}
          helperText = {this.state.username === "" ? 'Please enter your username.' : ''}
          />
          <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value = {this.state.password}
          onChange ={event =>this.setState({password: event.target.value})}
          error = {this.state.password === ""}
          helperText = {this.state.password === "" ? 'Please enter your password.' : ''}
          />
          <Button 
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          >
          Sign In
          </Button>
          </form>
          </div>
          </Container>
          )}
      {!this.state.login && (
        <Container component="main" maxWidth="xs">
        <CssBaseline />
      <div>
        <Avatar>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form onSubmit = {this.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                value = {this.state.firstName}
                onChange ={event =>this.setState({firstName: event.target.value})}
                error = {this.state.firstName === ""}
                helperText = {this.state.firstName === "" ? 'Please enter your first name.' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                value = {this.state.lastName}
                onChange ={event =>this.setState({lastName: event.target.value})}
                error = {this.state.lastName === ""}
                helperText = {this.state.lastName === "" ? 'Please enter your last name.' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value = {this.state.username}
                onChange ={event =>this.setState({username: event.target.value})}
                error = {this.state.username === ""}
                helperText = {this.state.username === "" ? 'Please pick a username.' : ''}
              />
             </Grid>
             <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="location"
                label="Location"
                name="location"
                value = {this.state.location}
                onChange ={event =>this.setState({location: event.target.value})}
                error = {this.state.location === ""}
                helperText = {this.state.location === "" ? 'Please enter a location.' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="description"
                label="Description"
                name="description"
                value = {this.state.description}
                onChange ={event =>this.setState({description: event.target.value})}
                error = {this.state.description === ""}
                helperText = {this.state.description === "" ? 'Please enter a description.' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="occupation"
                label="Occupation"
                name="occupation"
                value = {this.state.occupation}
                onChange ={event =>this.setState({occupation: event.target.value})}
                error = {this.state.occupation === ""}
                helperText = {this.state.occupation === "" ? 'Please enter an occupation or "unemployed"!' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value = {this.state.password}
                onChange ={event =>this.setState({password: event.target.value})}
                error = {this.state.password === ""}
                helperText = {this.state.password === "" ? 'Please enter a password.' : ''}
              />
            </Grid>
             <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="reenterPassword"
                type="password"
                id="reenterPassword"
                label="Re-enter Password"
                value = {this.state.reenterPassword}
                onChange ={event =>this.setState({reenterPassword: event.target.value})}
                error = {this.state.reenterPassword !== this.state.password}
                helperText = {this.state.reenterPassword !== this.state.password ? 'Ensure your passwords match.' : ''}
              />

            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            >
            Register Me
          </Button>
        </form>
      </div>
    </Container>

			)}

			<Grid container justify = "flex-end">
            <Grid item xs>
              <Button onClick = {this.handleLoginToggle} variant = "text">
                {this.state.login ? "Dont have an account? Sign up!" : "Already have an account? Sign In!"}
              </Button>
            </Grid>
          </Grid>
			</div>
		);
	}

}

export default LoginRegister;