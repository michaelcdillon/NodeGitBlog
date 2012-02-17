/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./lib/routes')
  , mongoose = require ('mongoose')
  , dao = require('./lib/dao')
  , blog = require ('./lib/blog')
  , github = require ('./lib/github')
  , config = require ('config')
  , redisStore = require ('connect-redis')(express)
  , serverConfig = config.Server
  , routesConfig = config.Routes;

dao.setup (mongoose);
blog.setup (dao);
github.setup (dao, blog);

var app = module.exports = express.createServer();

var secretKey = String (serverConfig.secretKey);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.session({ secret: secretKey }));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.session({ secret: secretKey, store: new redisStore ()}));
  app.use(express.errorHandler()); 
});

// Routes

app.get (routesConfig.index, routes.index);
app.post (routesConfig.gitHubPostRecieve, github.checkForContentChanges, routes.newGitHubPost);
app.get (routesConfig.postRequest, blog.preparePost, routes.viewPost);

app.listen(serverConfig.listenPort);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
