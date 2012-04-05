
/**
 * Module dependencies.
 */

var express = require('express'),
    jshint = require('jshint'),
    config = require('./lib/config.js').config,
    rules = require('./lib/rules.js').rules,
    util = require('util'),
    spy = require('./lib/spy.js');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
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

app.get('/', function(req, res){  
  var errorsCount = 0,
      report = [],      
      analysisData = spy.analysisData;
  Object.keys(analysisData).forEach(function(key) {
    errorsCount += analysisData[key].length;
    // Get file path relative to base path
    report.push({file: key.substr(config.basePath.length), errors: analysisData[key]});
  });
  res.render('index', {
    totalErrorsCount: errorsCount,
    report: report
  });
});

// Start analyzing code
spy.spy(config.basePath);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
