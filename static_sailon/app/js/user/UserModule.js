'use strict';

angular.module('userModule', ['ngCookies', 'socketModule', 'workspaceModule', 'ui.bootstrap']).
	factory('userModel', ['socket', '$location', '$route', '$cookies', 'POPUSH_SETTINGS', UserModel]).
	controller('SwitchController', ['$scope', 'userModel', 'socket', '$location', '$timeout', SwitchController]).
	controller('SignInController', ['$scope', 'userModel', 'socket', '$location', '$cookies', 'fileTreeModel', 'messageModel', 'tabsModel', SignInController]).
	controller('SignUpController', ['$scope', 'userModel', 'socket', '$location', 'messageModel', SignUpController]).
	controller('SettingsController', ['$scope', 'userModel', '$translate', SettingsController]).
	controller('PasswordController', ['$scope', 'userModel', 'socket', PasswordController]).
	controller('AvatarController', ['$scope', 'userModel', 'socket', AvatarController]).
	//controller('ThemeController', ['$scope', 'userModel', 'socket', ThemeController]).
	controller('LanguageController', ['$scope', 'userModel', '$translate', LanguageController]);//.
	//controller('FontController', ['$scope', 'userModel', 'socket', FontController]);