var config = require ('config').GitHubSettings;
var httpClient = require ('request');
var dao = require ('../dao');
var blog = require ('../blog');

/**
  * Finds if there are any content changes in the JSON payload
  * from a github post-receive URL. An array object is built that
  * tells how many changed content files there are and when they
  * occured.
  */
function findContentChanges (payload) {
    var payload = JSON.parse (payload);
    var commits = payload.commits;
    var contentChanged = new Array ();
    
    contentChanged['added'] = new Array ();
    contentChanged['modified'] = new Array ();
    contentChanged['removed'] = new Array ();
    contentChanged['numChanges'] = 0;
    
    // get the latest commited changes. 
    var commit = commits.pop ();

    // find the newly added content
    for (var newContent in commit.added) {
        if (commit.added[newContent].indexOf (config.contentDir) != -1) {
            contentChanged.added.push (commit.added[newContent]);
            contentChanged.numChanges += 1; 
        }
    }
    
    // find the modified content
    for (var modified in commit.modified) {
        if (commit.modified[modified].indexOf (config.contentDir) != -1) {
            contentChanged.modified.push (commit.modified[modified]);
            contentChanged.numChanges++;
        }
    }

    // find the removed content
    for (var removed in commit.removed) {
        if (commit.removed[removed].indexOf (config.contentDir) != -1) {
            contentChanged.modified.push (commit.removed[removed]);
            contentChanged.numChanges += 1; 
        }
    }

    contentChanged.timestamp = commit.timestamp;
    contentChanged.id = commit.id;
    contentChanged.authorEmail = commit.author.email;
    contentChanged.name = commit.author.name;
    contentChanged.username = commit.author.username;
     
    return contentChanged;    
}

/**
  * Through the dao, stores the new content in the database.
  */
function storeNewContent (fileName, content, timestamp, id, authorEmail, username, name) {
    console.log ('Storing ' + fileName + ' : ' + content);
    blog.parseMetaDataAndContent (content, function (postData) {
        var meta = postData.meta;
        var content = postData.content;
        console.log ('Title: ' + meta.title);
        dao.SaveNewPost (fileName, meta.title, content, 
                         timestamp, id, authorEmail, 
                         username, name
        );

    });
}


/**
  * Builds a url to fetch raw files from a github repository. The
  * url is built from config statements in the default config file.
  * The file contents are fetched from github and then passed through
  * the next function to the proper function that will store the changes
  * in the database.
  */
function fetchContent (fileName, next, timestamp, id, authorEmail, username, name) {
    var rawUrl = "https://" + config.rawUrl + "/" + config.username;
    rawUrl += "/" + config.repo + "/" + config.branch + "/" + fileName;
    
    console.log ('Fetching: ' + rawUrl);
    
    httpClient ({uri: rawUrl}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            next (fileName, body, timestamp, id, authorEmail, username, name);
        }
        else {
            console.log (response.statusCode + " | " + error);
        }
    });
}

/**
  * Goes through all of the arrays in changedContent and
  * fetches the content that was added or changed and stores
  * or updates the documents in the datastore after the
  * content is fetched. If there are any deletions then those
  * are handled as well.
  */
function actOnChangedContent (changedContent) {
    var newContent = changedContent.added;
    var modifiedContent = changedContent.modified;
    var removedContent = changedContent.removed;

    for (var fileName in newContent) {
        fetchContent (newContent[fileName], storeNewContent, 
            changedContent.timestamp, changedContent.id, 
            changedContent.authorEmail, changedContent.username,
            changedContent.name
        );
    }

    for (var fileName in modifiedContent) {
        console.log ('Modified files: ' + modifiedContent[fileName]);
        fetchContent (modifiedContent[fileName], storeNewContent, 
            changedContent.timestamp, changedContent.id, 
            changedContent.authorEmail, changedContent.username,
            changedContent.name
        );
    }

}

/**
  * Called when a Post-Receive URL hook is fired from GitHub.
  * The JSON payload is sent to a parser to find out if any
  * changes were commited to blog content. If changes were
  * made then those files are fetched and subsequently stored
  * in the database.
  */
exports.checkForContentChanges = function (req, res, next) {
    var contentChanged = findContentChanges (req.body.payload);
    
    console.log ("GitHub Push, Content Changed: " + contentChanged.numChanges);
     
    if (contentChanged.numChanges > 0) 
        actOnChangedContent (contentChanged);               

    next ();
}
