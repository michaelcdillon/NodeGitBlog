
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , dao = require('./dao')
  , github = require ('./github')
  , blog = require ('./blog')
  , routes_config = require ('config').Routes;

dao.setup ();

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get ('/', routes.index);
app.post ('/newPush', github.checkForContentChanges, routes.newGitHubPost);
app.get ('/post/:title', blog.preparePost, routes.viewPost);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
