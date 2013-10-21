'use strict';

angular.module('docModule', ['ngCookies', 'socketModule', 'ui.bootstrap']).
	factory('docModel', ['socket', '$location', '$route', '$cookies', 'POPUSH_SETTINGS', DocModel]).
	controller('Controller', ['$scope', 'userModel', 'socket', '$location', '$cookies', Controller]);