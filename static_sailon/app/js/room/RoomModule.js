'use strict';

angular.module('roomModule', ['userModule', 'socketModule', 'workspaceModule', 
	'ngCookies', 'ui.bootstrap', 'pascalprecht.translate']).
	controller('RoomController', ['$scope', 'userModel', 'socket', '$location', 'tabsModel', RoomController]);