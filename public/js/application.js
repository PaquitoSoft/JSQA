
$(document).ready(function() {
	
	var createReportTable = function(data) {

		var html = '<table class="table table-striped table-bordered table-condensed">' +
					'<thead><tr>' +
						'<th>Line</th>' +
						'<th>Column</th>' +
						'<th>Message</th>' +
						'<th>Context</th>' +
					'</tr></thead>' +
					'<tbody>';

		$(data.errors).each(function(index, item) {
			if (item) {
				html += ('<tr>' +
							'<td>' + item.line + '</td>' +
							'<td>' + item.character + '</td>' +
							'<td>' + item.reason + '</td>' +
							'<td>' + item.evidence + '</td>' +
						'</tr>');
			}
		});

		html += '</tbody></table>';

		return html;
	};

	var createReport = function(data) {
		var counter = Date.now();
		var html = '<div class="accordion-group">' + 
						'<div class="accordion-heading">' + 
							'<a class="accordion-toggle" href="collapse_' + counter + '" data-toggle="collapse">' +
								'<span class="badge badge-error errorsCount">' + data.errors.length + '</span>' +
								'<h4 class="filename" data-filename="' + data.formattedFilename + '">' + data.file + '</h4>' + 
							'</a>' +
						'</div>' + 
						'<div id="collapse_' + counter + '" class="accordion-body collapse">' + 
							'<div class="accordion-inner">' +
								createReportTable(data) +
							'</div>' +
						'</div>' +
					'</div>';
		return html;
	};

	var socket = io.connect('http://' + $('#hostname').attr('value'));

	socket.on('fileUpdated', function(data) {		
		console.info("\nApplication# File has been updated: " + data.file);
		
		var parent, 
			el = $('h4.filename[data-filename="' + data.formattedFilename + '"]');

		if (el.length > 0) {
			console.info("Application# Received file report already exists.");

			// Existing file new report
			parent = el.closest('.accordion-group');

			// Check if file is now valid
			if (data.errors.length < 1) {
				console.info("Application# New report has no errors so we remove the previous one.");
				// Remove previous report from document
				parent.remove();
			} else {
				console.info("Application# Let's update file report with new data.");
				// Update file badge
				parent.find('.errorsCount').first().text(data.errors.length);
				// Update file report
				parent.find('.accordion-inner').html(createReportTable(data));
			}

		} else {
			// New file report
			if (data.errors.length > 0) { // This is because weird behaviour of node fs.watch API
				console.info("Application# Let's create a new report...");
				console.info($('#accordionReport'));
				console.info(createReport(data));
				$('#accordionReport').append(createReport(data));
			}			
		}
	
	});

});
