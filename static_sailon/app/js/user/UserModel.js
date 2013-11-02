'use strict';

function UserModel(socket, $location, $route, $cookies, POPUSH_SETTINGS) {
	
	// Static Data

	var supportedLanguages = {'zh-CN': true, 'en-US': true};

	// User Services

	var loadLang = function() {
		if (supportedLanguages[$cookies['ui-lang']]) {
			return $cookies['ui-lang'];
		} else {
			var defaultLang = navigator.language ? navigator.language : navigator.browserLanguage;
			if (!supportedLanguages[defaultLang]) {
				defaultLang = 'en-US';
			}
			$cookies['ui-lang'] = defaultLang;
			return defaultLang;
		}
	}

	var setLang = function(newLang) {
		if (supportedLanguages[newLang]) {
			$cookies['ui-lang'] = newLang;
			language = newLang;
			return newLang;
		} else {
			language = loadLang();
			return language;
		}
	}

	var logout = function() {
		socket.emit('logout', {
		});
		userLock.signed = false;
		userLock.signIn = false;
		delete {'u': currentUser}.u;
		delete $cookies['sid'];
		$location.path("/"); 
	}

	// User Data

	var connected = false,
		language = loadLang(),
		userLock = {
			'signIn': false, 
			'signed': false, 
			'relogin': false
		},
		currentUser = {};

	// Socket Services

	socket.forceOn('connect', function() {
		socket.emit('version', {});
	});

	socket.forceOn('version', function(data) {
		if(data.version != POPUSH_SETTINGS.VERSION) {
			$route.reload();
		}
		connected = true;
		if($cookies['sid']){
			userLock.signIn = true;
			socket.emit('relogin', {sid:$cookies['sid']});
		} else {
			userLock.signIn = false;
		}
	});

	socket.forceOn('unauthorized', function() {
		userLock.relogin = true;
		logout();
	});

	return {
		isConnected: function() {return connected;},
		getLanguage: function() {return language;},
		setLanguage: setLang,
		lock: userLock,
		user: currentUser,
		logout: logout
	};
}