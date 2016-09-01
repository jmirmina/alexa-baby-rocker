/**
 * The NodeJS entry point. Sets up the server to listen to port 443 
 * and initializes the Baby Rocker App. Certificate and private key
 * must be added to the /ssl directory.
 **/

'use strict';

var app = require('./alexa-app').app,
	cert = '/home/pi/rocker/ssl/certificate.pem', 
	fs = require('fs'),
	https = require('https'),
	key = '/home/pi/rocker/ssl/private-key.pem',
	server;

server = https.createServer({ cert: fs.readFileSync(cert), key: fs.readFileSync(key) }, function(request, response) {
	var output = '';

	request.on('data', function(chunk) {
		output += chunk
	});

	request.on('end', function() {
		app.request(JSON.parse(output)).then(function(data) {
			response.end(JSON.stringify(data));
		});
	});

	request.resume();
});

server.listen(443, function () {
	console.log('https server listening on port 443');
});
