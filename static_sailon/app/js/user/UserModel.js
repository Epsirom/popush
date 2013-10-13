'use strict';

function UserModel(socket, $location, $route, $cookies, POPUSH_SETTINGS) {
	var userService = {
		loadLang: function() {
			if (navigator.language) {
				return navigator.language;
			}
			else {
				return navigator.browserLanguage;
			}
		},
		loadTheme: function() {
			return $cookies.theme;
		}
	}

	// User Data

	var connected = false,
		signed = false,
		language = userService.loadLang(),
		theme = userService.loadTheme();

	// User Services & Socket Services

	socket.on('connect', function() {
		socket.emit('version', {});
	});

	socket.on('version', function(data) {
		if(data.version != POPUSH_SETTINGS.VERSION) {
			$route.reload();
		}
		connected = true;
		if($cookie.sid){
			socket.emit('relogin', {sid:$cookie.sid});
		} else {
			signed = false;
		}
		
	});

	return {
		isConnected: function() {return connected;},
		signed: signed,
		language: language,
		theme: theme
	};
}