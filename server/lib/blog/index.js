var dao = require ('../dao');
var markdown = require ("markdown").markdown;

/**
  * Pulls out the meta data of the post and also the content
  * and passes this data to the callback.
  */
exports.parseMetaDataAndContent = function (postContent, next) {
    var lines = postContent.split ("\n");
    var meta = eval("(" + lines[0] + ")");
    console.log ('Meta: ' + meta);
    
    var content = postContent.replace (lines[0] + "\n", "");
    var content = markdown.toHTML (content);

    next ({
        meta    : meta,
        content : content
    });
}

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
}
