/**
 * This is the main app code which takes requests from Alexa, checkes the state of each baby,
 * determines whether to start/stop the motor, and generates the proper Alexa response.
 **/

'use strict';

var _ = require('underscore'),
	Rocker = require('./rocker').rocker,
	alexa = require('alexa-app'),
	app = new alexa.app('RockNPlay'),
	appID = 'AMAZON APP ID GOES HERE',
	arrayToSentence = require('array-to-sentence'),
	babies = {
		'Aiden': new Rocker(33, 35, 37),
		'Hailey': new Rocker(40, 38, 36)
	};

module.exports = { app: app };

app.pre = function(request, response, type) {
	console.log('Alexa Request Made...');

	if (request.sessionDetails.application.applicationId != appID) {
		response.fail("Invalid Alexa Application");
	}
};

app.launch(function(request, response) {
	response.say('Who would you like me to rock?');
	response.shouldEndSession(false, 'Who would you like me to rock?');
});

app.intent('StartRocking', function(request, response) {
	var	alreadyRocking = [],
		started = [];

	// Loop over each baby and attempt to rock them
	_.each(getBabiesFromRequest(request), function(name) {
		(babies[name].startRocking() ? started : alreadyRocking).push(name);
	});

	// Check if we actually started rocking someone
	if (started.length) {
		response.say('I\'ve started rocking ' + arrayToSentence(started) + '.');
	}

	// Check if anyone was already rocking
	if (alreadyRocking.length) {
		response.say(arrayToSentence(alreadyRocking) + ' ' + (alreadyRocking.length == 1 ? 'is' : 'are') + ' already rocking.');
	}

	// Reprompt if no babies were returned from Alexa
	if (started.length == 0 && alreadyRocking.length == 0) {
		response.shouldEndSession(false, 'I\'m sorry, I don\'t understand. Who would you like me to rock?');
	}
});

app.intent('StopRocking', function(request, response) {
	var alreadyStopped = [],
		babiesToStop = getBabiesFromRequest(request),
		stopped = [];

	// If no babies were specified, we should stop all of them
	if (babiesToStop.length == 0) {
		babiesToStop = _.keys(babies);
	}

	// Loop over each baby and attempt to rock them
	_.each(babiesToStop, function(name) {
		(babies[name].stopRocking() ? stopped : alreadyStopped).push(name);
	});

	// Check if we actually stopped rocking someone
	if (stopped.length) {
		response.say('I\'ve stopped rocking ' + arrayToSentence(stopped) + '.');
	}

	// Check if anyone was already stopped
	if (alreadyStopped.length) {
		response.say(arrayToSentence(alreadyStopped) + ' ' + (alreadyStopped.length == 1 ? 'is' : 'are') + ' already stopped.');
	}
});

app.sessionEnded(function(request, response) {
	_.each(babies, function(babyApp) {
		babyApp.stopRocking();
	});
});

function getBabiesFromRequest(request) {
	return _.filter([request.slot('BabyA'), request.slot('BabyB')], function(baby) {
		return _.has(babies, baby);
	});
}
