import AddCommentIcon from '@material-ui/icons/AddComment';
import React from 'react';
import {
  Card, CardHeader, CardMedia, CardContent,
} from '@material-ui/core';
import {
  List,
  ListItem,
}
from '@material-ui/core';
import './userPhotos.css';
import {
  Link
} from 'react-router-dom';

import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';


//import fetchModel from "../../lib/fetchModelData";
import axios from 'axios';


/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        currUser: undefined,
        currUserPhotos: undefined,
        commentToAdd: "",
    };
    this.addComment = this.addComment.bind(this);


    let urlUser = "http://localhost:3000/user/" + this.props.match.params.userId;
    axios.get(urlUser).then((response) => {
        this.setState({currUser: response.data});
    })
    .catch((error)=>{
      console.log(error);
      throw error;
    });

    let urlPhotos = "http://localhost:3000/photosOfUser/" + this.props.match.params.userId;
    axios.get(urlPhotos).then((response) => {
        this.setState({currUserPhotos: response.data});
        this.props.setDisplay("Photos of " + this.state.currUser.first_name + " " + this.state.currUser.last_name);
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
  }

  addComment(event){
    var currPhoto = this.state.currUserPhotos[event.target.id];
    var url = "http://localhost:3000/commentsOfPhoto/" + currPhoto._id;
    var body = {comment: this.state.commentToAdd,};
    axios.post(url, body)
    .then(()=>{
      //var currPhotos = this.state.currUserPhotos; 
      //var currPhotoComments = currPhotos[event.target.id].comments;
      //currPhotoComments[currPhotoComments.length] = this.state.commentToAdd;
      this.setState({commentToAdd: ""});
    })
    .catch((err) =>{
      console.log(err);
      throw err;
    });
  }

  renderComments(currPhoto){
    var commentArr = [];
    var retComments;
    if (typeof currPhoto.comments !== "undefined"){
      for (var commentnum = 0; commentnum < currPhoto.comments.length; commentnum++){
        var currComment = currPhoto.comments[commentnum];
        commentArr[commentnum] = 
          <ListItem key = {commentnum}>
          <Link to={`/users/${currComment.user._id}`}> <b>{currComment.user.first_name} {currComment.user.last_name}: </b> </Link> &nbsp;
          <div className = "comments">
              {currComment.comment} <br/>
              [{currComment.date_time}]
          </div>
          </ListItem>
      }
      retComments = 
      <div>
        <List className = "list">
          {commentArr}
        </List>
      </div>
    }

    return retComments;
  }

  renderPictures(){
    var photos = [];
    var retVal; 
    if (typeof this.state.currUserPhotos !== "undefined"){
      for (var photonum = 0; photonum < this.state.currUserPhotos.length; photonum++){
        var currPhoto = this.state.currUserPhotos[photonum];
        photos[photonum] = 
          <ListItem key = {photonum}>
            <Card className = "cardstyles">
              <CardHeader
                subheader = {currPhoto.date_time}
              />
              <CardMedia
                image = {`/images/${currPhoto.file_name}`}
                className = "imagelayout"
              />
              <CardContent>
                <div>
                  {this.renderComments(currPhoto)}
                </div>
              </CardContent>
              <CardContent>
              <TextField
                label="Add a comment"
                onChange = {event =>this.setState({commentToAdd: event.target.value})}
                InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                  <AddCommentIcon />
                  </InputAdornment>
          ),
                endAdornment: (
                  <InputAdornment position="end">
                  <IconButton aria-label = "post" id = {photonum} onClick = {this.addComment}>
                  <ChevronRightIcon/>
                  </IconButton>
                  </InputAdornment>)
        }}
      />
      </CardContent>
            </Card>
        </ListItem>;
      }

    retVal = 
      <div>
      <List className = "list">
        {photos}
      </List>
      </div>;
    }
      return retVal;
  }

 render() {
    return (
      this.state.currUser && this.state.currUserPhotos ? (
      <div>
      <Link to={"/users/" + this.state.currUser._id}> ⇠ return to {this.state.currUser.first_name}&apos;s profile  </Link>
        <div>
        {this.renderPictures()}
        </div>
      </div>) : (<div/>)
    );
  }
}

export default UserPhotos;
