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
  , serverConfig = config.Server
  , routesConfig = config.Routes;

dao.setup (mongoose);
blog.setup (dao);
github.setup (dao, blog);

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

app.get (routesConfig.index, routes.index);
app.post (routesConfig.gitHubPostRecieve, github.checkForContentChanges, routes.newGitHubPost);
app.get (routesConfig.postRequest, blog.preparePost, routes.viewPost);

app.listen(serverConfig.listenPort);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
