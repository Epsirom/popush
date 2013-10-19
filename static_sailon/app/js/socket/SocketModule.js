'use strict';

angular.module('socketModule', []).
	value('POPUSH_SETTINGS', {
		'VERSION': '1.0.3',
		'SOCKET_IO': '/',
		'SAVE_TIME_OUT': 1000,
		'ENABLE_RUN': true,
		'ENABLE_DEBUG': true
	}).
	value('VERSION', '1.0.3').
	value('SOCKET_IO', '/').
	value('SAVE_TIME_OUT', 1000).
	value('ENABLE_RUN', true).
	value('ENABLE_DEBUG', true).
	factory('socket', ['$rootScope', 'SOCKET_IO', function($rootScope, SOCKET_IO) {
		var socket = io.connect(SOCKET_IO);
		return {
			onScope: function(scope, events) {
				var eventName;
				for (eventName in events) {
					this.forceOn(eventName, events[eventName]);
				}
				scope.$on('$destroy', function() {
					for (eventName in events) {
						socket.removeAllListeners(eventName);
					}
				})
			},
			on: function(eventName, callback) {
				if (socket.$events && socket.$events[eventName]) {
					return;
				}
				socket.on(eventName, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						callback.apply(socket, args);
					});
				});
			},
			forceOn: function(eventName, callback) {
				if (socket.$events && socket.$events[eventName]) {
					delete socket.$events[eventName];
				}
				socket.on(eventName, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						callback.apply(socket, args);
					});
				});
			},
			emit: function(eventName, data, callback) {
				socket.emit(eventName, data, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						if (callback) {
							callback.apply(socket, args);
						}
					})
				})
			},
			removeAllListeners: function(e) {
				socket.removeAllListeners(e);
			}
		}
	}]);