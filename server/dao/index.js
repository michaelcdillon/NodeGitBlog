var MONGO_CONFIG = require ('config').MongoDB;
var mongoose = require ('mongoose');
var models = require ('./../models');

mongoose.connect('mongodb://' + MONGO_CONFIG.host + '/' + MONGO_CONFIG.db);

var UserModel;
var PostModel;

exports.setup = function () {
    UserModel = mongoose.model ('User', models.UserSchema);
    PostModel = mongoose.model ('Post', models.PostSchema);
}

exports.CreateNewUser = function (lastName, firstName, email, bio, next) {
    var newUser = new UserModel ({
        lastName    : lastName,
        firstName   : firstName,
        email       : email,
        bio         : bio   
    });
    
    newUser.save (function (error) {
        if (!error) {
            console.log ("New User Saved: " + newUser.lastName + ", " + newUser.firstName);
            next ();
        }
        else 
            console.log ("Error saving new User: " + error);
    });
};

exports.FindUser = function (searchField, searchValue, next) {
    var queryFields = {};
    queryFields[searchField] = searchValue;

    UserModel.findOne (queryFields, function (error, user) {
        if (!error) {
            if (user) {
                console.log ("Found the user: " + user);
                next (user);
            }
            else
                console.log ("Couldn't find the user via field/value: " + searchField + " : " + searchValue);
        }
        else 
            console.log ("An error occured while finding a user: " + searchField + " : " + searchValue + " | " + error);
    });
}

exports.CreateNewPost = function (user, title, datePublished, content) {
    var newPost = new PostModel ({
        author          : user,
        title           : title,
        datePublished   : datePublished,
        content         : content 
    });
    
    newPost.save (function (error) {
        if (!error) {
            console.log ("New Post Saved: " + newPost.title);
            user.posts.push (newPost);

            user.save (function (error) {
                if (!error)
                    console.log ('Post added to user');
                else
                    console.log ("Error adding post to user: " + error);    
            });
        }
        else
            console.log ("Error saving new Post: " + error);
    });
}
