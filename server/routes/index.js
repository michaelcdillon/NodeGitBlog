
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/**
  * POST hook from github that is fired when new commits 
  * come into the repo.
  */
exports.newGitHubPost = function (req, res) {
    res.send ("OK");
}

/**
  * Sets up a post to be viewed and then renders it.
  */
exports.viewPost = function (req, res) {
    var postData = {
        email       : req.postEmail,
        username    : req.postUsername,
        name        : req.postName,
        commitId    : req.postCommitId,
        lastUpdated : req.postDate,
        title       : req.postTitle,
        content     : req.postContent,
    };

    res.render ('post', postData);
}
