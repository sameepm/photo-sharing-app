"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();
var fs = require("fs");


// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
//var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
* URL /admin.login - Login a User
*/
app.post('/admin/login', function (request, response){
    var login_name = request.body.login_name;

    User.findOne({login_name: login_name}, function(err, user){
        if (err){
            console.log("login error");
            response.status(400).send(err.message);
            return;
        }

        if(!user){
            console.log(login_name + "does not exist.");
            response.status(400).send(login_name + "is not a valid user.");
            return;
        }

        if(request.body.password !== user.password){
          response.status(400).send("Incorrect password.");
            return;
        }

        request.session.user_id = user._id;
        request.session.login_name = login_name;
        response.status(200).send(user);
    });

});


/*
* URL /admin/logout - logout a User
*/
app.post('/admin/logout', function(request, response){
    if(!request.session.user_id || !request.session.login_name){
        console.log("no logged in user to log out");
        response.status(401).send("No user logged in.")
        return;
    }

    delete request.session.user_id;
    delete request.session.login_name;

    request.session.destroy(function(err){
        if (err){
            console.log("could not destroy session");
            response.status(400).send(err.message);
            return;
        }
        response.status(200).end();
    });
});

/*
* URL /commentsOfPhoto/:photo_id - add comment to photo whose id is photo_id
*/

app.post('/commentsOfPhoto/:photo_id', function(request, response){

    if(!request.session.user_id || !request.session.login_name){
        console.log("no logged in user to log out");
        response.status(401).send("No user logged in.")
        return;
    }

    var photo_id = request.params.photo_id;
    if (request.body.comment.length == 0 || !request.body.comment){
        console.log("No comments for" + photo_id);
        response.status(400).send("Empty comments");
        return;
    }

    Photo.findOne({_id: photo_id}, function(err, photo){
        if(err){
            console.log("error fetching photos for" + photo_id);
            response.status(400).send(err.message);
            return;
        }

        if(!photo){
            console.log("photo doesnt exist");
            response.status(400).send("No photo found");
            return;
        }

        var newComment = {
            comment: request.body.comment, 
            user_id: request.session.user_id,
        };

        photo.comments = photo.comments.concat([newComment]);

        photo.save();
        response.status(200).send(photo);
    });
});

/*
* URL /photos/new - upload photo for the current user
*/
app.post('/photos/new', function (request, response){
    if(!request.session.user_id || !request.session.login_name){
        console.log("no logged in user to log out");
        response.status(401).send("No user logged in.")
        return;
    }

    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            console.log("process form body error");
            response.status(400).send(err.message);
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes

        // XXX - Do some validation here.
        if (request.file.fieldname !== "uploadedphoto"){
            response.status(400).send("wrong file property");
            return;
        }

        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            if (err){
                response.status(400).send("no file in POST request");
                return;
            }
            // XXX - Once you have the file written into your images directory under the name
            // filename you can create the Photo object in the database

            Photo.create({file_name: filename, date_time: timestamp, user_id: request.session.user_id, comments: []}, function (err, newPhoto){
                if(err){
                    response.status(400).send(err.message);
                    return;
                }
                newPhoto.id = newPhoto._id;
                newPhoto.save();
                console.log('Created object with ID', newPhoto._id);
                response.status(200).send(newPhoto);
            });
        });
    });
});

app.post('/user', function(request, response) {
    
    var login_name = request.body.login_name;

    if (!login_name){
        response.status(400).send("Login name doesn't exist");
        return;
    }

    if(login_name === ""){
        response.status(400).send("Login name cannot be blank.");
        return;
    }

    User.findOne({login_name: request.body.login_name}, function(err, user){
        if(err){
            response.status(400).send(err.message);
            return;
        }

        console.log(user);

        if(user !== null){
            response.status(400).send(login_name + "is already taken! :(");
            return;
        }

        User.create({
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            location: request.body.location,
            description: request.body.description,
            occupation: request.body.occupation,
            login_name: login_name,
            password: request.body.password,
        }, function(err, newUser){
                if(err){
                    response.status(400).send(err.message);
                    return;
                }
                newUser.save();
                newUser.id = newUser._id;
                request.session.user_id = newUser._id;
                request.session.login_name = newUser.login_name;
                response.status(200).send(newUser);
        });

    });
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {

    if(!request.session.user_id || !request.session.login_name){
        console.log("user not logged in.");
        response.status(401).end();
        return;
    }

    User.find({}, function (err, users) {
        if (err){
            response.status(500).send(err.message);
            return;
        }

        var dbList = JSON.parse(JSON.stringify(users));

        //loop through each user and pull things wanted

        for(var i = 0; i < dbList.length; i++){
            var dbUser = dbList[i];
            delete dbUser.location;
            delete dbUser.description;
            delete dbUser.occupation;
            delete dbUser.__v;
            delete dbUser.login_name;
            delete dbUser.password;
        }
        response.status(200).send(dbList);
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {

    if(!request.session.user_id || !request.session.login_name){
        console.log("no logged in user to log out");
        response.status(401).send("No user logged in.")
        return;
    }

    var id = request.params.id;
    User.findOne({_id: id}, function(err, user){
        if(err){
            response.status(400).send(err.message);
            return;
        }
        if (user === null){
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }

        var dbUser = JSON.parse(JSON.stringify(user));
        delete dbUser.__v;
        delete dbUser.login_name;
        delete dbUser.password;
        response.status(200).send(dbUser);
    });
});


app.post('/deleteUser/', function(request, response){
    if (!request.session.user_id){
        console.log("no user to delete");
        response.status(401).send("No user logged in.")
        return;
    }
    var userId = request.body.loggedInID;

    //first remove all photos created by this user
    Photo.remove({user_id: userId}, function(err, data){
        if (err){
            response.status(400).send(err);
        }

    });

    //then find go through all the photos and find the associated comments
    Photo.find({}, function(err, photos){
        if (err){
            response.status(400).send(err);
        }

        async.each(photos, function(eachPhoto){
            var newComments = [];
            async.each(eachPhoto.comments, function(eachComment){
                if (eachComment.user_id.equals(userId)){
                    newComments.push(eachComment);
                }

            });
            eachPhoto.comments = newComments;
            eachPhoto.save();
        });
    });

    //delete the user
    User.findOneAndRemove({_id: userId}, function(err, user){
        if (err){
            response.status(400).send(err);
        }
    });

    //delete the session and log out
    delete request.session.user_id;
    delete request.session.login_name;

    request.session.destroy(function(err){
        if (err){
            console.log("could not destroy session");
            response.status(400).send(err.message);
            return;
        }
        response.status(200).end();
    });

});



/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {

    if(!request.session.user_id || !request.session.login_name){
        console.log("no logged in user to log out");
        response.status(401).send("No user logged in.")
        return;
    }

    var id = request.params.id;

    var photoQuery = Photo.find({user_id: id});
    photoQuery.select("_id user_id comments file_name date_time").exec(function(err, photos){
        if (err){
            response.status(400).send(err.message);
            return;
        }
        if (photos === null){
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        //------------ async through every Photo in dbPhotos --------------//
        var dbPhotos = JSON.parse(JSON.stringify(photos));

        async.each(dbPhotos, function(photo, photoCallback){
            //----------- async through every comment in comments ---------//
            async.each(photo.comments, function(comment, commentCallback){
                //copy similar code as in get(user/:id)
                var id = comment.user_id;
                var userQuery = User.findOne({_id: id});
                userQuery.select("_id first_name last_name").exec(function(err, user){
                    if(err){
                        response.status(400).send(err.message);
                        return;
                    }

                    if(user === null){
                        console.log('User with _id:' + id + ' not found.');
                        response.status(500).send('Not found');
                        return;
                    }

                    var dbUser = JSON.parse(JSON.stringify(user));
                    comment.user = dbUser;
                    delete comment.user_id;

                    commentCallback();
                });
            }, function(err){
                if (err){
                    photoCallback(err);
                }
                photoCallback();
            });
        }, function (err){
            if (err){
                response.status(500).send(err.message);
                return;
            }
            response.status(200).send(dbPhotos);
        });
    });
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


