'use strict';

angular.module('userModule', ['ngCookies', 'socketModule']).
	factory('userModel', ['socket', '$location', '$route', '$cookies', 'POPUSH_SETTINGS', UserModel]).
	controller('SignInController', ['$scope', 'userModel', 'socket', '$location', SignInController]).
	controller('SignUpController', ['$scope', 'userModel', 'socket', '$location', SignUpController]).
	//controller('PasswordController', ['$scope', 'userModel', 'socket', PasswordController]).
	//controller('AvatarController', ['$scope', 'userModel', 'socket', AvatarController]).
	//controller('ThemeController', ['$scope', 'userModel', 'socket', ThemeController]).
	controller('LanguageController', ['$scope', 'userModel', 'socket', LanguageController]);//.
	//controller('FontController', ['$scope', 'userModel', 'socket', FontController]);