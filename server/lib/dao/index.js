var mongo_config = require ('config').MongoDB;
var models = require ('./../models');

var mongoose;

var UserModel;
var PostModel;
var RevisionModel;

/**
  * Binds the mongoose models to the schemas
  */
exports.setup = function (mongooseIn) {
    mongoose = mongooseIn;
    mongoose.connect('mongodb://' + mongo_config.host + '/' + mongo_config.db);

    UserModel = mongoose.model ('User', models.UserSchema);
    PostModel = mongoose.model ('Post', models.PostSchema);
    RevisionModel = mongoose.model ('Revision', models.RevisionSchema);
};

/**
  * Cleans the datastore by dropping all collections of
  * mongoose models.
  */
exports.CleanDatastore = function (next) {
    UserModel.collection.drop ();
    PostModel.collection.drop ();
    RevisionModel.collection.drop ();
    next ();
};

/**
  * Stores the new user in the database.
  */
function saveNewUser (name, username, email, next) {
    var newUser = new UserModel ({
        username    : username,
        email       : email,
        name        : name,
    });
    
    newUser.save (function (error) {
        if (!error) {
            console.log ("New User Saved: " + newUser.name);
            next (newUser);
        }
        else 
            console.log ("Error saving new User: " + error);
    });
};

/**
  * Creates a new user and passes that new user object
  * to the callback passed in.
  */
exports.CreateNewUser = function (name, username, email, next) {
    saveNewUser (name, username, email, next);
};

/**
  * Finds a user based on a searchfield and value specified
  * by the caller. The user object is passed to callback function
  */
function findUser (searchField, searchValue, next) {
    var queryFields = {};
    queryFields[searchField] = searchValue;

    UserModel.findOne (queryFields, function (error, user) {
        if (!error) {
            if (user) {
                console.log ("Found the user: " + user);
                next (user);
            }
            else {
                console.log ("Couldn't find the user via field/value: " + searchField + " : " + searchValue);
                next (null);
            }
        }
        else 
            console.log ("An error occured while finding a user: " + searchField + " : " + searchValue + " | " + error);
    });
}

/**
  * Fetches a user by the userid and passes it to the callback,
  * if the userid doesn't exist null will be passed.
  */
function fetchUser (userId, next) {
    UserModel.findById (userId, function (error, user) {
        if (!error) {
            next (user);
        }
        else {
            console.log ("An error occured while fetching a user: " + error);
            next (user);
        }
    });
}

/**
  * Finds a user based on a searchfield and value specified by the caller.
  */
exports.FindUser = function (searchField, searchValue, next) {
    findUser (searchField, searchValue, next);    
}

/**
  * Finds a post via provided search fields and value and 
  * then passes it to the callback, null if it can't be found
  * or doesn't exist.
  */
function findPost (searchField, searchValue, next) {
    var queryFields = {};
    queryFields[searchField] = searchValue;

    PostModel.findOne (queryFields, function (error, post) {
        if (!error) {
            if (post) {
                next (post);
            }
            else {
                console.log ("Couldn't find a post via field/value: " + searchField, " : " + searchValue);
                next (null);
            }
        }
        else {
            console.log ("An Error occured while finding a post: " + searchField + " : " + searchValue + " | " + error);
        }
    });
}

/**
  * Takes a post object and fetches the current revision for that post.
  * If the revision doesn't exist null will be passed back.
  */
function fetchCurrentRevision (post, next) {
    RevisionModel.findById (post.currentRevision, function (error, revision) {
        if (!error) {
            next (revision);
        }
        else {
            console.log ('Erorr occured while retrieving current revision: ' + error);
            next (null);
        }
    });
}

/**
  * Fetches a post by the title for display, this includes fetching the 
  * post itself, the author user object, and the current revision. Null is
  * passed back if any of these steps fail.
  */
exports.fetchPostForDisplay = function (title, next) {
    findPost ('title', title, function (post) {
        console.log ('searching for post: ' + title);
        if (post) {
            console.log ('found post');
            fetchUser (post.author, function (user) {
                fetchCurrentRevision (post, function (revision) {
                    if (revision) {
                        console.log ("found revision for post");
                        next (user, post, revision); 
                    }
                    else {
                        console.log ("This post doesn't have a current revision.");
                        next (null, null, null);
                    }
                });

            });
        }
        else {
            console.log ("Post doesn't exist: " + title);
            next (null, null, null);
        }
    });
}

/**
  * Stores a new post in the database. The user objects are updated with
  * relevant revision data and post data.
  */
function storeNewPost (user, fileName, title, datePublished, content, commitId) {
    var newRevision = new RevisionModel ({
        author          : user,
        commitId        : commitId,
        revisionDate    : datePublished,
        content         : content,
    });
    
    var newPost = new PostModel ({
        author          : user,
        title           : title,
        fileName        : fileName,
        revisions       : [newRevision],
        currentRevision : newRevision,
    });


    newRevision.save (function (error) {
        if (!error) {
            user.revisions.push (newRevision);
            newPost.save (function (error) {
                if (!error) {
                    user.posts.push (newPost);
                    user.save (function (error) {
                        if (!error) {
                            console.log ("New Post Saved."); 
                        }
                        else {
                            console.log ('Error saving user details after new post: ' + error);
                        }
                    });
                }
                else {
                    console.log ("Error saving new Post: " + error);
                }
            });
        }
        else {
            console.log ("Erorr saving revision: " + error);
        }
    });
}

/**
  * Fetches revisions by an array of ids, and passes the revisions
  * to the next callback.
  */
function fetchRevisionsByIds (revisionIds, next) {
    RevisionModel.find ({'_id' : {$in: revisionIds}}, function (error, revisions) {
        if (!error) {
            if (revisions) {
                next (revisions);
            }
            else {
                console.log ("Couldn't find any revisions with those ids");
                next (null);   
            }
        }
        else {
            console.log ('An error occured while fetching revisions by id array');
        }
    });
}

/**
  * Adds a new revision to a post if its needed.
  */
function updatePost (user, post, fileName, title, datePublished, content, commitId) {
    var newRevision = new RevisionModel ({
        author          : user,
        commitId        : commitId,
        revisionDate    : datePublished,
        content         : content,
    });


    fetchRevisionsByIds (post.revisions, function (revisions) {
        if (revisions != null) {
            // check through the revisions to make sure the commitId doesn't already exist.
            for (key in revisions) {
                if (revisions[key].commitId == commitId) {
                    console.log ('This revision already exists');
                    return;   
                }
            }

            // create a new revision for the post
            newRevision.save (function (error) {
                if (!error) {
                    post.revisions.push (newRevision);
                    post.currentRevision = newRevision;
                    post.save (function (error) {
                        if (!error) {
                            user.revisions.push (newRevision);
                            user.save (function (error) {
                                if (!error) {
                                    console.log ("A new revision was saved"); 
                                }
                                else {
                                    console.log ("A new revision wasn't saved to a user");
                                }
                            });
                        }
                        else {
                            console.log ("A revision was saved but not attributed to the post");
                        }
                    });
                }
                else {
                    console.log ('an error occured while saving a new revision: ' + error);
                }
            });

        }
        else {
            console.log ("Trying to update a post that doesn't have any revisions");
        }
    });
}

/**
  * Saves a new post in the database after finding the author user
  * object.
  */
exports.SaveNewPost = function (fileName, title, content, timestamp, id, authorEmail, username, name) {
    findPost ('fileName', fileName, function (post) {
        if (post == null) {
            findUser ('email', authorEmail, function (user) {
                if (user != null) {
                    storeNewPost (user, fileName, title, timestamp, content, id);   
                }
                else {
                    // the user doesn't exist so create it
                    saveNewUser (name, username, authorEmail, function (user) {
                        storeNewPost (user, fileName, title, timestamp, content, id);   
                    });
                }
            });
        }
        else {
            console.log ('Post already exists, adding a revision if needed');
            findUser ('email', authorEmail, function (user) {
                if (user != null) {
                        updatePost (user, post, fileName, title, timestamp, content, id);
                }
                else {
                    saveNewUser (name, username, authorEmail, function (user) {
                        updatePost (user, post, fileName, title, timestamp, content, id);
                    });
                }

            });
        }
    });
}

