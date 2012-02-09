var markdown = require ("markdown").markdown;

var dao;

exports.setup = function (daoIn) {
    dao = daoIn;
};

/**
  * Pulls out the meta data of the post and also the content
  * and passes this data to the callback. If the meta doesn't exist
  * or can't be parsed then null is returned.
  */
exports.parseMetaDataAndContent = function (postContent, next) {
    var lines = postContent.split ("\n");
    var meta = null;
    
    try {
        meta = JSON.parse (lines[0]);
    
        var content = postContent.replace (lines[0] + "\n", "");
        var content = markdown.toHTML (content);
        
        next ({
            meta    : meta,
            content : content
        });
    }
    catch (e) {
        console.log ('Error parsing blog meta: ' + e);
        next (null);
    }
     
};

/**
  * Prepares a post for display and takes the post
  * data dn writes it in the req object. If a post cannot
  * be found an error message is passed to the callback.
  */
exports.preparePost = function (req, res, next) {
    console.log ("Preparing to display post: " + req.params.title);
    dao.fetchPostForDisplay (req.params.title, function (user, post, revision) {
        if (user && post && revision) {
            req.postEmail = user.email;
            req.postUsername = user.username;
            req.postName = user.name;
            req.postCommitId = revision.commitId;
            req.postDate = revision.revisionDate;
            req.postTitle = post.title;
            req.postContent = revision.content;
            next ();
        }
        else {
            console.log ('Post cannot be found');
            next ();
        }
    });
};
