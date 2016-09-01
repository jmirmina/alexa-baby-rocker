/**
 * The rocker class that is used to intialize each Baby/Rocker/Motor.
 * This class toggles the motor on and off and keeps track of it's state.
 **/

'use strict';

var gpio = require('rpi-gpio');

module.exports = {
	// The enable pin is the GPIO pin that is used to toggle the motor on/off
	// The motorHighPin and motorLowPin determine the direction the motor will rotate
	rocker: function(enablePin, motorHighPin, motorLowPin) {
		var self = this;

		self._enablePin = enablePin;
		self._motorHighPin = motorHighPin;
		self._motorLowPin = motorLowPin;
		self._rocking = false;

		this._setupPin = function(pin, defaultValue) {
			gpio.setup(pin, gpio.DIR_OUT, function() {
				gpio.write(pin, defaultValue);
			});
		};

		this._toggleRocker = function(state) {
			var self = this;

			if (this.isRocking() == state) {
				return false;
			}
			
			gpio.write(self._enablePin, state, function() {
				self._rocking = state;
			});

			return true;
		};

		this.isRocking = function() {
			return this._rocking;
		};

		this.startRocking = function() {
			return this._toggleRocker(true);
		};

		this.stopRocking = function() {
			return this._toggleRocker(false);
		};

		// Initialize the motors
		this._setupPin(self._enablePin, false);
		this._setupPin(self._motorHighPin, true);
		this._setupPin(self._motorLowPin, false);
	}
}
