var util = require('util'),
	fs = require('fs'),
	path = require('path'),
	jshint = require('./jshint.js').JSHINT,
    rules = require('./rules.js').rules;


var currentAlerts = {};


function processAnalysisResults(filename, result) {
	currentAlerts[filename] = result;
	// util.log("Spy::processAnalysisResults# " + filename + " file analysis results:");
	// util.log(util.inspect(result));
}

function analyzeFile(file) {
	var buffer;
	util.log("Spy::analyzeFile# Scanning file: " + file);

	// Read file contents
	try {
        buffer = fs.readFileSync(file, 'utf-8');
    } catch (e) {
        util.log("Error: Cant open: " + file);
        util.log(e + '\n');
    }

    // Remove potential Unicode Byte Order Mark.
    buffer = buffer.replace(/^\uFEFF/, '');

	var result = jshint(buffer, rules);
	util.log("Spy::analyzeFile# Analysis Report result: " + result);
	processAnalysisResults(file, jshint.errors);
}

function spyFile(file) {
	
	// First we analyze the file
	analyzeFile(file);

	// Now we listen for changes so, if modified, we analyze it again
	fs.watchFile(file, function(curr, prev) {
		if (curr.size !== prev.size) { // File modified (Time comparision -mtime- is not working)
			util.log("Spy::spyFile# " + file + " file has been modified. Analyzing it again...");
			analyzeFile(file);
		}
	});
}

function spyFolder(folder) {
	fs.readdir(folder, function(err, files) {
		var filteredFiles = [], f;
		if (err) {
			util.log("Spy::spyFolder# Could not read folder: " + folder);
		} else {			
			files.forEach(function(filename) {
				f = path.join(folder,filename);
				if (fs.statSync(f).isDirectory()) {
					spyFolder(f)
				} else {					
					if (filename.indexOf('.js') === filename.length - 3) {
						spyFile(f);
					} else {
						util.log("Spy::spyFolder# Jumping over file: " + filename)
					}	
				}				
			});
		}
	});
}

function spy(basePath) {

	fs.stat(basePath, function(err, stats) {
		if (err) {
			util.log('Spy::spy# Could not stat file: ' + basePath + " -> " + err);
		} else {
			if (stats.isFile()) {
				spyFile(basePath);
			} else if (stats.isDirectory()) {
				spyFolder(basePath);
			} else {
				util.log("Spy::spy# Archive is not a file nor a directory: " + basePath);
			}
		}
	});

}

exports.spy = spy;
exports.analysisData = currentAlerts;