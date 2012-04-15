
/**
 * Module dependencies.
 */
var express = require('express'),
    config = require('./lib/config.js').config,
    util = require('util'),
    eventsEmitter = new require('events').EventEmitter(),
    spy = require('./lib/spy.js');


function customFilenameFormat(filename) {
  if (filename.indexOf('\\') != -1) {    
    return filename.replace(/\\/g, '_');
  } else if (filename.indexOf('/') != -1) {
    return filename.replace(/\//g, '_');
  }
  return filename;
}

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

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

// View helpers
app.dynamicHelpers({
  host: function(req) {
    return req.headers.host;
  }
});

// Routes
app.get('/', function(req, res){  
  var errorsCount = 0,
      shortFilename = '',
      report = [],      
      analysisData = spy.analysisData;
  Object.keys(analysisData).forEach(function(key) {
    errorsCount += analysisData[key].length;
    // Get file path relative to base path
    shortFilename = key.substr(config.basePath.length);
    report.push({
      file: shortFilename, 
      formattedFilename: customFilenameFormat(shortFilename),
      errors: analysisData[key]});
  });
  res.render('index', {
    totalErrorsCount: errorsCount,
    report: report
  });
});

// Start analyzing code
spy.spy(config.basePath, app);

// Start listening to clients
app.listen(5000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Socket.io initialization
/*
io.sockets.on('connection', function(sck) {

  // Send event to connected client (This event will be received by everybody)
  sck.emit('iknowyou', {
    msg: 'I know who you are'
  });

  // Listen to client custom event
  sck.on('anotherClientEvent', function(data) {
    util.log("App::initSocket::anotherClientEvent# Client emitted a new event: " + data);
  });
});
*/

// Notify clients when a new file analysis report is available
app.on('newFileAnalysis', function(data) {
  var filename = data.filename.substr(config.basePath.length);
  io.sockets.emit('fileUpdated', {
    file: filename,
    formattedFilename: customFilenameFormat(filename),
    errors: data.report
  });
});
