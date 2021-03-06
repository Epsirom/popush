'use strict';

angular.module('workspaceModule', ['userModule', 'socketModule', 'ngCookies', 'ui.bootstrap', 'pascalprecht.translate']).
	factory('messageModel', ['$timeout', 'socket', MessageModel]).
	factory('tabsModel', ['userModel', 'fileTreeModel', 'socket', TabsModel]).
	controller('MessageController', ['$scope', 'messageModel', MessageController]).
	controller('WorkspaceController', ['$scope', 'userModel', 'socket', '$cookies', '$location', 'messageModel', 'tabsModel', 'fileTreeModel', WorkspaceController]).
	controller('TabsController', ['$scope', 'userModel', 'socket', '$location', 'tabsModel', 'fileTreeModel', TabsController]);