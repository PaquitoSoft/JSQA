var util = require('util'),
	fs = require('fs'),
	path = require('path'),
	events = require('events'),
	jshint = require('./jshint.js').JSHINT,
    rules = require('./rules.js').rules,
    config = require('./config.js').config;

var app = null;

var currentAlerts = {};

// Let's prepare ecluded files/folders array
var excludedFiles = [];
config.excludedFiles.forEach(function(item) {
	util.log("Spy::init# Elemento excluido del analisis: " + path.join(config.basePath, item));
	excludedFiles.push(path.join(config.basePath, item));
});

/**
*	Returns true if the file/folder is a good candidate
*/
function checkFileCandidate(file) {
	return (excludedFiles.indexOf(file) === -1);
}

function processAnalysisResults(filename, result) {
	currentAlerts[filename] = result;
}

function analyzeFile(file) {
	var buffer;
	
	// Read file contents
	try {
        buffer = fs.readFileSync(file, 'utf-8');
    } catch (e) {
        util.log("Error: Cant open: " + file);
        util.log(e + '\n');
        throw new Error("Error: Cant open: " + file + " -- " + e);
    }

    // Remove potential Unicode Byte Order Mark.
    buffer = buffer.replace(/^\uFEFF/, '');
	
    // Set user-defined jshint options
	if (config.jshintOptions !== undefined) {
		if (typeof config.jshintOptions == 'object') {
			for (optionKey in config.jshintOptions) {
				var optionValue = config.jshintOptions[optionKey];
				if (rules[optionKey] === undefined) {
					util.log("Setting jshint option '" + optionKey + "' to " + optionValue);
				} else {
					util.log("Overriding jshint option '" + optionKey + "' to " + optionValue
							+ " (was " + rules[optionKey] + ")");
				}
				rules[optionKey] = optionValue;
			}
		} else {
			util.log("Error: Invalid 'jshintOptions' type (expected: object)");
		}
	}
  
	var result = jshint(buffer, rules);
	util.log("Spy::analyzeFile# Analyzed file: " + file + " ---> " + (result ? "OK" : "KO"));
	
	// Process analysis of files with errors only
	if (!result) {
		processAnalysisResults(file, jshint.errors);
	}

	// Notify the new report
	app.emit('newFileAnalysis', {
		filename: file,
		report: jshint.errors
	});
	
}

function spyFile(file) {
	if (checkFileCandidate(file)) {
		// First we analyze the file
		analyzeFile(file);

		// Now we listen for changes so, if modified, we analyze it again
		if (fs.watch) {
			fs.watch(file, function(event) {
				if ('change' === event) {
					util.log("Spy::spyFile# " + file + " file has been modified. Analyzing it again...");
					analyzeFile(file);
				}
			});
		} else {
			fs.watchFile(file, function(curr, prev) {
				if (curr.size !== prev.size) { // File modified (Time comparision -mtime- is not working)
					util.log("Spy::spyFile# " + file + " file has been modified. Analyzing it again...");
					analyzeFile(file);
				}
			});
		}
	} else {
		util.log("Spy::spyFile# Jumping over file: " + file + ". It's on the excluded files list.");
	}
}

function spyFolder(folder) {
	if (checkFileCandidate(folder)) {
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
	} else {
		util.log("Spy::spyFolder# Jumping over folder: " + folder + ". It's on the excluded folders list.");
	}
}

function spy(basePath, expressServer) {
	app = expressServer;

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
