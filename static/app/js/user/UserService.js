'use strict';

function UserService(socket, $location, $cookies) {
	return {
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
	};
}